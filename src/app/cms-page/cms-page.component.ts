import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { forkJoin, of, switchMap } from 'rxjs';
import { AuthService } from '../services/auth.service';
interface Item { id: number; text?: string; name?: string; description?: string | null; imageUrl?: string | null; isActive: boolean }
interface AnswerRow { statementId: number; statementText: string; answer: string | null }
@Component({selector:'rck-cms', imports:[FormsModule, RouterLink], templateUrl:'./cms-page.component.html', styleUrl:'./cms-page.component.css'})
export class CmsPageComponent {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  readonly auth = inject(AuthService);
  readonly statements = signal<Item[]>([]);
  readonly profiles = signal<Item[]>([]);
  readonly loading = signal(true);
  readonly busy = signal(false);
  readonly message = signal('');
  readonly error = signal('');
  readonly editor = signal<'statement' | 'profile' | null>(null);
  readonly selected = signal<Item | null>(null);
  readonly answers = signal<AnswerRow[]>([]);
  readonly answerProfile = signal<Item | null>(null);
  readonly pendingDelete = signal<{item:Item; kind:'statement'|'profile'} | null>(null);
  tab: 'statements'|'profiles' = 'statements';
  search = '';
  text = ''; name = ''; description = ''; imageUrl = ''; active = true;
  learningStyle = ''; innovationStyle = '';
  xDirection = 0; yDirection = 0; axisChanged = false;
  private position(profile: Item): {x:number;y:number} {return {x:profile.name?.startsWith('Praktisch')?1:profile.name?.startsWith('Theoretisch')?-1:0,y:profile.name?.endsWith('vernieuwend')?1:profile.name?.endsWith('behoudend')?-1:0};}
  private loadAxes(item:Item):void {
    const profiles=this.profiles();if(!profiles.length)return;this.busy.set(true);
    forkJoin(profiles.map(p=>this.http.get<AnswerRow[]>("/parties/"+p.id+"/answers"))).subscribe({next:all=>{if(this.selected()?.id!==item.id){this.busy.set(false);return;}let x=0,y=0;all.forEach((rows,i)=>{const a=rows.find(r=>r.statementId===item.id)?.answer;const value=a==='eens'?1:a==='oneens'?-1:0;const pos=this.position(profiles[i]);x+=value*pos.x;y+=value*pos.y;});this.xDirection=Math.sign(x);this.yDirection=Math.sign(y);this.busy.set(false);},error:e=>{this.busy.set(false);this.fail(e);}});
  }
  updateProfileName(): void { this.name = this.learningStyle && this.innovationStyle ? this.learningStyle + ' & ' + this.innovationStyle : ''; }
  readonly activeCount = computed(() => this.statements().filter(s => s.isActive).length);
  constructor() { this.load(); }
  rows(): Item[] { const q=this.search.toLowerCase(); return (this.tab==='statements'?this.statements():this.profiles()).filter(s=>(s.text??s.name??'').toLowerCase().includes(q)); }
  load(): void {
    this.loading.set(true);
    forkJoin({statements:this.http.get<Item[]>('/statements/all'), profiles:this.http.get<Item[]>('/parties')}).subscribe({next:r=>{this.statements.set(r.statements);this.profiles.set(r.profiles);this.loading.set(false);},error:e=>{this.fail(e);this.loading.set(false);}});
  }
  edit(kind:'statement'|'profile', item:Item|null=null): void { if(kind==='profile')return; this.selected.set(item);this.text=item?.text??'';this.name=item?.name??'';this.learningStyle=this.name.startsWith('Theoretisch')?'Theoretisch':this.name.startsWith('Praktisch')?'Praktisch':'';this.innovationStyle=this.name.endsWith('vernieuwend')?'vernieuwend':this.name.endsWith('behoudend')?'behoudend':'';this.description=item?.description??'';this.imageUrl=item?.imageUrl??'';this.active=item?.isActive??true;this.editor.set(kind);this.error.set('');this.message.set('');this.xDirection=0;this.yDirection=0;this.axisChanged=false;if(kind==='statement'&&item)this.loadAxes(item); }
  save(): void {
    const kind=this.editor();if(!kind||this.busy()||kind==='profile')return;
    if(!(kind==='statement'?this.text.trim():this.name.trim())){this.error.set('Vul de verplichte velden in.');return;}
    if(this.imageUrl && !/^https?:\/\//i.test(this.imageUrl)){this.error.set('Gebruik een volledige http- of https-URL voor de afbeelding.');return;}
    const body=kind==='statement'?{text:this.text.trim(),isActive:this.active}:{name:this.name.trim(),description:this.description.trim()||null,imageUrl:this.imageUrl.trim()||null,isActive:this.active};
    const path=kind==='statement'?'/statements':'/parties';const item=this.selected();this.busy.set(true);this.error.set('');
    const request=item?this.http.patch(`${path}/${item.id}`,body):this.http.post(path,body);
    request.pipe(switchMap(result=>{
      if(kind!=='statement'||!this.axisChanged)return of(result);
      const id=item?.id??(result as {id:number}).id;
      const requests=this.profiles().map(profile=>{const pos=this.position(profile);const score=Number(this.xDirection)*pos.x+Number(this.yDirection)*pos.y;const answer=score>0?'eens':score<0?'oneens':'neutraal';return this.http.put(`/parties/${profile.id}/answers/${id}`,{answer});});
      return requests.length?forkJoin(requests):of(result);
    })).subscribe({next:()=>{this.busy.set(false);this.editor.set(null);this.message.set('Wijzigingen opgeslagen.');this.load();},error:e=>{this.busy.set(false);this.fail(e);}});
  }
  remove(): void {
    const pending=this.pendingDelete();if(!pending||this.busy()||pending.kind==='profile')return;this.busy.set(true);
    this.http.delete(`${pending.kind==='statement'?'/statements':'/parties'}/${pending.item.id}`).subscribe({next:()=>{this.busy.set(false);this.pendingDelete.set(null);this.message.set('Verwijderd.');this.load();},error:e=>{this.busy.set(false);this.pendingDelete.set(null);this.fail(e);}});
  }
  showAnswers(item:Item): void {this.answerProfile.set(item);this.answers.set([]);this.busy.set(true);this.error.set('');this.http.get<AnswerRow[]>(`/parties/${item.id}/answers`).subscribe({next:r=>{this.answers.set(r);this.busy.set(false);},error:e=>{this.busy.set(false);this.fail(e);}});}
  answer(row:AnswerRow,event:Event): void {const value=(event.target as HTMLSelectElement).value;const profile=this.answerProfile();if(!profile||this.busy())return;this.busy.set(true);this.error.set('');this.http.put(`/parties/${profile.id}/answers/${row.statementId}`,{answer:value||null}).subscribe({next:()=>{this.answers.update(rows=>rows.map(r=>r.statementId===row.statementId?{...r,answer:value||null}:r));this.busy.set(false);this.message.set('Antwoord opgeslagen.');},error:e=>{(event.target as HTMLSelectElement).value=row.answer??'';this.busy.set(false);this.fail(e);}});}
  logout():void {this.auth.endSession();void this.router.navigateByUrl('/login');}
  private fail(e:unknown):void {this.error.set(e instanceof HttpErrorResponse?(e.error?.error??'De verbinding met de backend is mislukt. Probeer opnieuw.'):'Opslaan is mislukt.');}
}




