import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { ButtonComponent } from '../../../../../components/button/button.component';
import type { DropdownOption } from '../../../../../components/dropdown/dropdown.component';
import { DropdownComponent } from '../../../../../components/dropdown/dropdown.component';
import { EmptyStateComponent } from '../../../../../components/empty-state/empty-state.component';
import { SearchBarComponent } from '../../../../../components/search-bar/search-bar.component';
import { StatusBadgeComponent } from '../../../../../components/status-badge/status-badge.component';
import type { Statement } from '../../../../../types/cms-statement.interface';
import type { StatusFilter } from '../../../../admin-page.interfaces';

export const STATUS_FILTER_OPTIONS: readonly DropdownOption[] = [
  { value: 'all', label: 'Alle statussen' },
  { value: 'active', label: 'Actief' },
  { value: 'inactive', label: 'Inactief' },
];

const STATUS_FILTER_VALUES: readonly StatusFilter[] = ['all', 'active', 'inactive'];

@Component({
  selector: 'stw-statements-table',
  imports: [ButtonComponent, DropdownComponent, EmptyStateComponent, SearchBarComponent, StatusBadgeComponent],
  templateUrl: './statements-table.component.html',
  styleUrl: './statements-table.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatementsTableComponent {
  public readonly statements = input.required<readonly Statement[]>();

  public readonly total = input.required<number>();

  public readonly page = input.required<number>();

  public readonly pageSize = input.required<number>();

  public readonly search = input('');

  public readonly status = input.required<StatusFilter>();

  public readonly loading = input(false);

  public readonly searchChange = output<string>();

  public readonly statusChange = output<StatusFilter>();

  public readonly pageChange = output<number>();

  public readonly addRequested = output();

  public readonly editRequested = output<number>();

  public readonly deleteRequested = output<number>();

  protected readonly statusOptions = STATUS_FILTER_OPTIONS;

  protected readonly totalPages = computed(() => Math.max(1, Math.ceil(this.total() / this.pageSize())));

  protected goToPreviousPage(): void {
    if (this.page() > 1) {
      this.pageChange.emit(this.page() - 1);
    }
  }

  protected goToNextPage(): void {
    if (this.page() < this.totalPages()) {
      this.pageChange.emit(this.page() + 1);
    }
  }

  protected handleStatusChange(value: string): void {
    const match = STATUS_FILTER_VALUES.find(candidate => candidate === value);

    if (match !== undefined) {
      this.statusChange.emit(match);
    }
  }
}

