// item-entry.component.ts
import { DecimalPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal.component';
import { MobileFormatPipe } from '../../../shared/pipes/mobile-format.pipe';
import { ItemService } from '../../item.service';
import { Item, ItemStatus } from '../../models/item';
import { BudgetPlanComponent } from '../../components/budget-plan/budget-plan.component';
import { BudgetPlanService } from '../../budget-plan.service';

@Component({
  selector: 'app-item-entry',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, MobileFormatPipe, DecimalPipe, RouterLink, BudgetPlanComponent], // add
  templateUrl: './item-entry.component.html',
  styleUrl: './item-entry.component.scss'
})
export class ItemEntryComponent {
  //isSmallTable = false;

  itemService = inject(ItemService);
  budgetPlanService = inject(BudgetPlanService)

  items: Item[] = [];
  filterItems = this.items;
  filterInput = new FormControl<string>('', { nonNullable: true });

  modalService = inject(BsModalService);
  bsModalRef?: BsModalRef;

  constructor() {
    this.itemService.list().subscribe((vs) => {
      this.items = vs;
      this.filterItems = vs;
      
      // update use
      const used = this.items
        .filter(v => v.status === ItemStatus.APPROVED)
        .map(v => +v.price)
        .reduce((p, v) => p += v, 0)
      this.budgetPlanService.updateUsed(used)
    });

    this.filterInput.valueChanges.subscribe((keyword) => {
      this.filterItems = this.items.filter((item) => item.title.includes(keyword));
    });
  }

  onConfirm(item: Item) {
    const initialState: ModalOptions = {
      initialState: {
        title: `Confirm to delete "${item.title}" ?`
      }
    };
    this.bsModalRef = this.modalService.show(ConfirmModalComponent, initialState);
    this.bsModalRef?.onHidden?.subscribe(() => {
      if (this.bsModalRef?.content?.confirmed) {
        this.onDelete(item.id);
      }
    });
  }

  onDelete(id: number) {
    this.itemService
      .delete(id)
      .subscribe(() => (this.filterItems = this.filterItems.filter((v) => v.id != id)));
  }
}
