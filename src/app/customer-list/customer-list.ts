import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { CustomerService } from '../services/customer.service';
import { ReviewService } from '../services/review.service';
import { RestaurantService } from '../services/restaurant.service';
import { VisitService } from '../services/visit.service';

import { ICustomer } from '../models/customer.model';
import { IReview } from '../models/review.model';
import { IRestaurant } from '../models/restaurant.model';
import { IVisit } from '../models/visit.model';

import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatDialogModule],
  templateUrl: './customer-list.html',
})
export class CustomerList implements OnInit {

  Math = Math;

  // ========================
  // CUSTOMERS
  // ========================
  customers: ICustomer[] = [];
  filteredCustomers: ICustomer[] = [];
  customerEditId?: string;
  loading = true;
  errorMsg = '';
  searchControl = new FormControl('');
  customerForm!: FormGroup;
  editting = false;
  showForm = false;
  showAllCustomers = false;
  limit = 2;
  currentPage = 1;
  expanded: { [key: string]: boolean } = {};

  // ========================
  // REVIEWS
  // ========================
  reviewsByCustomer: { [key: string]: IReview[] } = {};
  restaurants: IRestaurant[] = [];
  reviewForm!: FormGroup;
  selectedCustomerId: string | null = null;
  editingReviewId: string | null = null;
  reviewLimit = 1;
  reviewPage: { [key: string]: number } = {};
  reviewTotal: { [key: string]: number } = {};
  minglobalRatingFilter: number | null = null;
  sortByLikes = false;

  // ========================
  // VISITS
  // ========================
  customerVisits: { [key: string]: IVisit[] } = {};
  loadingVisits: { [key: string]: boolean } = {};
  visitForm!: FormGroup;
  activeVisitForm = false;
  isEditingVisit = false;
  currentCustomerId: string | null = null;
  selectedVisitId: string | null = null;
  visitCurrentPage: number = 1;
  visitPageSize: number = 5;
  visitTotalPages: number = 1;
  visitTotalItems: number = 0;

  constructor(
    private api: CustomerService,
    private reviewService: ReviewService,
    private restaurantService: RestaurantService,
    private visitService: VisitService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog
  ) {
    this.customerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/)]],
    });

    this.reviewForm = this.fb.group({
      restaurant_id: ['', Validators.required],
      globalRating: [null, [Validators.required, Validators.min(1), Validators.max(10)]],
      comment: ['']
    });

    this.visitForm = this.fb.group({
      restaurant_id: ['', [Validators.required, Validators.pattern(/^[0-9a-fA-F]{24}$/)]],
      billAmount: [0, [Validators.required, Validators.min(1)]],
      pointsEarned: [0, [Validators.required, Validators.min(0)]],
      date: [new Date().toISOString().substring(0, 10), Validators.required]
    });
  }

  // ========================
  // INIT
  // ========================

  ngOnInit(): void {
    this.load();
    this.loadRestaurants();

    this.searchControl.valueChanges.subscribe(value => {
      const term = value?.toLowerCase().trim() ?? '';
      this.filteredCustomers = this.customers.filter(c =>
        c.name.toLowerCase().includes(term)
      );
      this.currentPage = 1;
    });
  }

  // ========================
  // CUSTOMERS
  // ========================

  load(): void {
    this.loading = true;
    this.errorMsg = '';

    this.api.getCustomers().subscribe({
      next: (res: any) => {
        const data = res?.data ?? res ?? [];
        this.customers = data;
        this.filteredCustomers = [...data];
        this.currentPage = 1;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.errorMsg = 'Error loading customers';
        this.customers = [];
        this.filteredCustomers = [];
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  guardar(): void {
    if (this.customerForm.invalid) return;

    const data = this.customerForm.value;

    const request = this.editting && this.customerEditId
      ? this.api.updateCustomer(this.customerEditId, data)
      : this.api.createCustomer(data);

    request.subscribe(() => {
      this.load();
      this.resetForm();
    });
  }

  isCustomerDisabled(customer: ICustomer): boolean {
    const state = customer as ICustomer & {
      active?: boolean;
      disabled?: boolean;
      deleted?: boolean;
      isDeleted?: boolean;
    };

    if (typeof state.active === 'boolean') {
      return !state.active;
    }

    return Boolean(state.disabled ?? state.deleted ?? state.isDeleted);
  }

  toggleCustomerStatus(customer: ICustomer): void {
    if (!customer._id) return;

    const wasDisabled = this.isCustomerDisabled(customer);

    const request = wasDisabled
      ? this.api.restoreCustomer(customer._id)
      : this.api.softDeleteCustomer(customer._id);

    request.subscribe({
      next: () => {
        (customer as ICustomer & { active?: boolean }).active = wasDisabled;
        this.filteredCustomers = [...this.filteredCustomers];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.errorMsg = 'Error updating customer status';
      }
    });
  }

  delete(id: string): void {
    this.api.deleteCustomer(id).subscribe(() => this.load());
  }

  confirmDelete(id: string, name?: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, { data: name });
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.delete(id);
    });
  }

  edit(customer: ICustomer): void {
    this.showForm = true;
    this.editting = true;
    this.customerEditId = customer._id;
    this.customerForm.patchValue({
      name: customer.name,
      email: customer.email,
      password: ''
    });
  }

  resetForm(): void {
    this.showForm = false;
    this.editting = false;
    this.customerEditId = undefined;
    this.customerForm.reset();
  }

  toggleShowForm(): void {
    this.showForm = !this.showForm;
    this.editting = false;
    this.customerForm.reset();
  }

  get visibleCustomers(): ICustomer[] {
    const start = (this.currentPage - 1) * this.limit;
    const end = start + this.limit;
    return this.filteredCustomers.slice(start, end);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredCustomers.length / this.limit));
  }

  nextCustomersPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  prevCustomersPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  // ========================
  // REVIEWS
  // ========================

  loadRestaurants(): void {
    this.restaurantService.getRestaurants().subscribe({
      next: (res: any) => {
        this.restaurants = res?.data ?? res ?? [];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.restaurants = [];
        this.cdr.detectChanges();
      }
    });
  }

  toggleExpand(id: string): void {
  this.expanded[id] = !this.expanded[id];

  if (this.expanded[id]) {
    this.reviewPage[id] = 0;
    this.visitCurrentPage = 1;
    this.loadReviews(id);
    this.loadVisits(id);
   }
}

  loadReviews(customerId: string): void {
    const page = this.reviewPage[customerId] || 0;
    const skip = page * this.reviewLimit;

    this.reviewService.getByCustomer( customerId, this.reviewLimit, skip, this.minglobalRatingFilter || undefined, this.sortByLikes ).subscribe((res: any) => {
      this.reviewsByCustomer = {
        ...this.reviewsByCustomer,
        [customerId]: res?.data ?? []
      };
      this.reviewTotal[customerId] = res?.total ?? 0;
      this.cdr.detectChanges();
    });
  }

  nextPage(customerId: string): void {
    const page = this.reviewPage[customerId] || 0;
    const total = this.reviewTotal[customerId] || 0;
    if ((page + 1) * this.reviewLimit >= total) return;
    this.reviewPage[customerId] = page + 1;
    this.loadReviews(customerId);
  }

  prevPage(customerId: string): void {
    if ((this.reviewPage[customerId] || 0) === 0) return;
    this.reviewPage[customerId]--;
    this.loadReviews(customerId);
  }

  openReviewForm(customerId: string): void {
    this.selectedCustomerId = customerId;
    this.editingReviewId = null;
    this.reviewForm.reset();
  }

  editReview(review: IReview): void {
    const customerId = typeof review.customer_id === 'string'
      ? review.customer_id
      : review.customer_id._id;

    this.selectedCustomerId = customerId;
    this.editingReviewId = review._id!;
    this.expanded[customerId] = true;

    this.reviewForm.patchValue({
      restaurant_id: review.restaurant_id._id,
      globalRating: review.globalRating,
      comment: review.comment ?? ''
    });
  }

  createReview(): void {
    if (this.reviewForm.invalid || !this.selectedCustomerId) return;

    if (this.editingReviewId) {
      const data = {
        globalRating: this.reviewForm.value.globalRating,
        comment: this.reviewForm.value.comment
      };
      this.reviewService.update(this.editingReviewId, data)
        .subscribe(() => this.finishReviewAction());
      return;
    }

    const restaurantId = this.reviewForm.value.restaurant_id;
    const exists = this.reviewsByCustomer[this.selectedCustomerId]?.find(
      r => r.restaurant_id._id === restaurantId
    );

    if (exists) {
      alert('Already reviewed');
      return;
    }

    const data = {
      ...this.reviewForm.value,
      customer_id: this.selectedCustomerId,
      date: new Date()
    };

    this.reviewService.create(data)
      .subscribe(() => this.finishReviewAction());
  }

  finishReviewAction(): void {
    const id = this.selectedCustomerId;
    this.reviewForm.reset();
    this.selectedCustomerId = null;
    this.editingReviewId = null;
    if (id) this.loadReviews(id);
  }

  deleteReview(reviewId: string, customerId: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: 'Delete this review?'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.reviewService.delete(reviewId)
          .subscribe(() => this.loadReviews(customerId));
      }
    });
  }

  like(review: IReview): void {
    this.reviewService.like(review._id!)
      .subscribe(updated => review.likes = updated.likes);
  }

  getStars(globalRating: number): number[] {
    return Array(Math.round(globalRating / 2)).fill(0);
  }

  // ========================
  // VISITS
  // ========================

  loadVisits(customerId: string): void {
  this.loadingVisits[customerId] = true;
  this.customerVisits = { ...this.customerVisits, [customerId]: [] };
  this.currentCustomerId = customerId;
  this.cdr.markForCheck();

  this.visitService.getVisitsByCustomer(customerId, this.visitCurrentPage, this.visitPageSize).subscribe({
    next: (res: any) => {
      console.log('customerId recibido:', customerId);
      console.log('res.data:', res.data);
      console.log('customerVisits ANTES:', JSON.stringify(this.customerVisits));
      
      this.customerVisits = {
        ...this.customerVisits,
        [customerId]: res.data ?? []
      };
      
      console.log('customerVisits DESPUÉS:', JSON.stringify(this.customerVisits));
      
      this.visitTotalPages = res.pagination?.pages ?? 1;
      this.visitTotalItems = res.pagination?.total ?? 0;
      this.loadingVisits[customerId] = false;
      this.cdr.detectChanges();
     },
     error: (err: any) => {
      console.error('Error loading visits', err);
      this.customerVisits = { ...this.customerVisits, [customerId]: [] };
      this.loadingVisits[customerId] = false;
      this.cdr.markForCheck();
     }
   });
  }

  changeVisitPage(page: number): void {
    if (page >= 1 && page <= this.visitTotalPages) {
      this.visitCurrentPage = page;
      if (this.currentCustomerId) {
        this.loadVisits(this.currentCustomerId);
      }
    }
  }

  prepareNewVisit(customerId: string): void {
    this.currentCustomerId = customerId;
    this.isEditingVisit = false;
    this.activeVisitForm = true;
    this.visitForm.reset({
      date: new Date().toISOString().substring(0, 10),
      billAmount: 0,
      pointsEarned: 0
    });
  }

  editVisit(visit: IVisit, customerId: string): void {
    this.currentCustomerId = customerId;
    this.selectedVisitId = visit._id!;
    this.isEditingVisit = true;
    this.activeVisitForm = true;

    const restaurantId = (visit.restaurant_id as any)?._id || visit.restaurant_id;
    const formattedDate = new Date(visit.date).toISOString().substring(0, 10);

    this.visitForm.patchValue({
      restaurant_id: restaurantId,
      billAmount: visit.billAmount,
      pointsEarned: visit.pointsEarned,
      date: formattedDate
    });
  }

  saveVisit(): void {
    if (this.visitForm.invalid) return;
    const formValue = this.visitForm.value;

    if (this.isEditingVisit && this.selectedVisitId) {
      const updatePayload = {
        date: formValue.date,
        pointsEarned: Number(formValue.pointsEarned),
        billAmount: Number(formValue.billAmount)
      };
      this.visitService.updateVisit(this.selectedVisitId, updatePayload).subscribe({
        next: () => {
          this.loadVisits(this.currentCustomerId!);
          this.cancelVisitForm();
        },
        error: (err) => alert('Error al actualizar: ' + (err.error?.message || 'Revisa Joi'))
      });
    } else {
      const createPayload = {
        customer_id: this.currentCustomerId,
        restaurant_id: formValue.restaurant_id,
        date: formValue.date,
        pointsEarned: Number(formValue.pointsEarned),
        billAmount: Number(formValue.billAmount)
      };
      this.visitService.createVisit(createPayload).subscribe(() => {
        this.loadVisits(this.currentCustomerId!);
        this.cancelVisitForm();
      });
    }
  }

  softDeleteVisit(visitId: string, customerId: string): void {
    if (confirm('¿Deseas enviar esta visita a la papelera?')) {
      this.visitService.updateVisit(visitId, { deletedAt: new Date() }).subscribe({
        next: () => this.loadVisits(customerId),
        error: (err) => console.error('Error en Soft Delete:', err)
      });
    }
  }

  deleteVisit(visitId: string, customerId: string): void {
    if (confirm('¿Seguro que quieres borrar permanentemente (Hard Delete)?')) {
      this.visitService.deleteVisit(visitId).subscribe(() => {
        this.loadVisits(customerId);
      });
    }
  }

  cancelVisitForm(): void {
    this.activeVisitForm = false;
    this.selectedVisitId = null;
    this.visitForm.reset();
  }
}