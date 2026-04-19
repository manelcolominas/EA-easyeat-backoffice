import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl, FormArray } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { CustomerService } from '../services/customer.service';
import { ReviewService, IPaginatedReviews } from '../services/review.service';
import { RestaurantService } from '../services/restaurant.service';
import { VisitService } from '../services/visit.service';
import { BadgeService } from '../services/badge.service';

import { ICustomer } from '../models/customer.model';
import { IReview } from '../models/review.model';
import { IRestaurant } from '../models/restaurant.model';
import { IVisit } from '../models/visit.model';
import { IBadge } from '../models/badge.model';
import { PaginationUtils } from '../services/pagination.util';
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
  deletedCustomers: ICustomer[] = [];
  filteredCustomers: ICustomer[] = [];
  filteredDeletedCustomers: ICustomer[] = [];
  pagedCustomers: ICustomer[] = [];
  pagedDeletedCustomers: ICustomer[] = [];
  customerEditId?: string;
  searching: boolean = false;
  searchDeleted: boolean = false;
  loading: boolean = true;
  loadingDeleted: boolean = false;
  errorMsg: string = '';
  searchControl = new FormControl('');
  searchDeletedControl = new FormControl('');
  customerForm!: FormGroup;
  editting = false;
  showForm = false;
  customerPager = { page: 1, limit: 2 };
  deletedPager = { page: 1, limit: 2 };
  expanded: { [key: string]: boolean } = {};
  expandedDeleted: { [key: string]: boolean } = {};
  goToPageControl = new FormControl<number | null>(1);
  goToDeletedPageControl = new FormControl<number | null>(1);

  // ========================
  // REVIEWS
  // ========================
  reviews: IReview[] = [];
  reviewsByCustomer: { [key: string]: IReview[] } = {};
  restaurants: IRestaurant[] = [];
  reviewForm!: FormGroup;
  selectedCustomerId: string | null = null;
  editingReviewId: string | null = null;
  reviewLimit = 2;
  reviewPage: { [key: string]: number } = {};
  reviewTotal: { [key: string]: number } = {};
  minGlobalRatingFilter: number | null = null;
  sortByLikes = false;
  goToReviewPageControl = new FormControl<number | null>(1);

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
  visitPage: { [customerId: string]: number } = {};
  visitTotal: { [key: string]: number } = {};
  visitLimit = 2;
  visitsExpanded: { [customerId: string]: boolean } = {};
  visitSortField: 'date' | 'billAmount' | 'pointsEarned' = 'date';
  visitSortOrder: 'asc' | 'desc' = 'desc';
  goToVisitPageControl = new FormControl<number | null>(1);

  customerBadges: { [key: string]: IBadge[] } = {};
  loadingBadges: { [key: string]: boolean } = {};

  constructor(
    private api: CustomerService,
    private reviewService: ReviewService,
    private restaurantService: RestaurantService,
    private visitService: VisitService,
    private badgeService: BadgeService,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private paginationUtils: PaginationUtils,
    private fb: FormBuilder,
  ) {
    this.customerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        [Validators.required, Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/)],
      ],
    });

    this.reviewForm = this.fb.group({
      restaurant_id: ['', Validators.required],
      globalRating: [null, [Validators.required, Validators.min(1), Validators.max(10)]],
      comment: [''],
      ratings: this.fb.group({
        foodQuality: [null, [Validators.min(0), Validators.max(10)]],
        staffService: [null, [Validators.min(0), Validators.max(10)]],
        cleanliness: [null, [Validators.min(0), Validators.max(10)]],
        environment: [null, [Validators.min(0), Validators.max(10)]],
      }),
      images: this.fb.array([]),
    });

    this.visitForm = this.fb.group({
      restaurant_id: ['', [Validators.required, Validators.pattern(/^[0-9a-fA-F]{24}$/)]],
      billAmount: [0, [Validators.required, Validators.min(1)]],
      pointsEarned: [0, [Validators.required, Validators.min(0)]],
      date: [new Date().toISOString().substring(0, 10), Validators.required],
    });
  }

  // ========================
  // INIT
  // ========================

  ngOnInit(): void {
    this.load();
    this.loadRestaurants();

    this.searchControl.valueChanges.subscribe((value) => {
      const term = value?.toLowerCase().trim() ?? '';
      term ? (this.searching = true) : (this.searching = false);
      this.filteredCustomers = this.customers.filter((c) => c.name.toLowerCase().includes(term));
      this.customerPager.page = 1;
      this.updatePagedCustomers();
    });

    this.searchDeletedControl.valueChanges.subscribe((value) => {
      const term = value?.toLowerCase().trim() ?? '';
      term ? (this.searchDeleted = true) : (this.searchDeleted = false);
      this.filteredDeletedCustomers = this.deletedCustomers.filter((c) =>
        c.name.toLowerCase().includes(term),
      );
      this.deletedPager.page = 1;
      this.updatePagedDeletedCustomers();
    });
  }

  // ========================
  // CUSTOMERS
  // ========================

  load(): void {
    this.loading = true;
    this.errorMsg = '';

    this.api.getCustomers().subscribe({
      next: (res: ICustomer[]) => {
        const data = res ?? [];
        this.customers = data;
        this.filteredCustomers = [...data];
        this.updatePagedCustomers();
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error(err);
        this.errorMsg = 'Error loading customers';
        this.customers = [];
        this.filteredCustomers = [];
        this.loading = false;
        this.cdr.markForCheck();
      },
    });

    this.loadingDeleted = true;

    this.api.getDeletedCustomers().subscribe({
      next: (res: ICustomer[]) => {
        const data = res ?? [];
        this.deletedCustomers = data;
        this.filteredDeletedCustomers = [...data];
        this.updatePagedDeletedCustomers();
        this.loadingDeleted = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error(err);
        this.deletedCustomers = [];
        this.filteredDeletedCustomers = [];
        this.loadingDeleted = false;
        this.cdr.markForCheck();
      },
    });
  }

  guardar(): void {
    if (this.customerForm.invalid) return;

    const data = this.customerForm.value;

    const request =
      this.editting && this.customerEditId
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

  toggleCustomerStatus(customerId: string, customer: ICustomer): void {
    if (!customer._id) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: `disable the customer ${customer.name}`,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const wasDisabled = this.isCustomerDisabled(customer);

        const request = wasDisabled
          ? this.api.restoreCustomer(customerId)
          : this.api.softDeleteCustomer(customerId);

        request.subscribe({
          next: () => {
            (customer as ICustomer & { active?: boolean }).active = wasDisabled;
            this.filteredCustomers = [...this.filteredCustomers];
            this.pagedCustomers = [...this.pagedCustomers];
            this.cdr.markForCheck();

            this.load();
          },
          error: (err) => {
            console.error(err);
            this.errorMsg = 'Error updating customer status';
          },
        });
      }
    });
  }

  hardDelete(id: string): void {
    this.api.hardDeleteCustomer(id).subscribe(() => this.load());
  }

  confirmDelete(id: string, name?: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, { data: name });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) this.hardDelete(id);
    });
  }

  edit(customer: ICustomer): void {
    this.showForm = true;
    this.editting = true;
    this.customerEditId = customer._id;
    this.customerForm.patchValue({
      name: customer.name,
      email: customer.email,
      password: '',
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
    if (this.searching) {
      return this.filteredCustomers;
    }
    return this.pagedCustomers;
  }

  get visibleDeletedCustomers(): ICustomer[] {
    if (this.searchDeleted) {
      return this.filteredDeletedCustomers;
    }
    return this.pagedDeletedCustomers;
  }

  get totalPages(): number {
    return this.paginationUtils.getTotalPages(this.filteredCustomers.length, this.customerPager.limit);
  }

  loadRestaurants(): void {
    this.restaurantService.getRestaurants().subscribe({
      next: (res: IRestaurant[]) => {
        this.restaurants = res ?? [];
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error(err);
        this.restaurants = [];
        this.cdr.markForCheck();
      },
    });
  }

  get imagesControls(): FormArray {
    return this.reviewForm.get('images') as FormArray;
  }

  addImage(initialUrl: string = ''): void {
    this.imagesControls.push(this.fb.control(initialUrl));
  }

  removeImage(index: number): void {
    this.imagesControls.removeAt(index);
  }

  private clearFormArray(array: FormArray): void {
    while (array.length > 0) {
      array.removeAt(0);
    }
  }

  toggleExpand(id: string): void {
    this.expanded[id] = !this.expanded[id];

    if (this.expanded[id]) {
      this.reviewPage[id] = 1; // Initialize page to 1
      this.loadReviews(id);

      this.visitPage[id] = 1; // Initialize page to 1
      this.loadVisits(id);

      this.loadCustomerBadges(id);
    }
  }

  goToPage(): void {
    const requestedPage = Number(this.goToPageControl.value);
    this.customerPager.page = this.paginationUtils.getSafePage(requestedPage, this.filteredCustomers.length, this.customerPager.limit);
    this.goToPageControl.setValue(this.customerPager.page, { emitEvent: false });
    this.updatePagedCustomers();
  }

  // ========================
  // DELETED CUSTOMERS PAGINATION
  // ========================

  get totalDeletedPages(): number {
    return this.paginationUtils.getTotalPages(this.filteredDeletedCustomers.length, this.deletedPager.limit);
  }

  goToDeletedPage(): void {
    const requestedPage = Number(this.goToDeletedPageControl.value);
    this.deletedPager.page = this.paginationUtils.getSafePage(requestedPage, this.filteredDeletedCustomers.length, this.deletedPager.limit);
    this.goToDeletedPageControl.setValue(this.deletedPager.page, { emitEvent: false });
    this.updatePagedDeletedCustomers();
  }

  private updatePagedDeletedCustomers(): void {
    this.deletedPager.page = this.paginationUtils.getSafePage(this.deletedPager.page, this.filteredDeletedCustomers.length, this.deletedPager.limit);
    this.pagedDeletedCustomers = this.paginationUtils.getPaginatedData(
      this.filteredDeletedCustomers,
      this.deletedPager.page,
      this.deletedPager.limit
    );
    this.cdr.markForCheck();
  }

  toggleExpandDeleted(id: string): void {
    this.expandedDeleted[id] = !this.expandedDeleted[id];

    if (this.expandedDeleted[id]) {
      this.reviewPage[id] = 1; // Initialize page to 1
      this.loadReviews(id);

      this.visitPage[id] = 1; // Initialize page to 1
      this.loadVisits(id);

      this.loadCustomerBadges(id);
    }
  }

  restoreDeletedCustomer(customerId: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: 'restore this customer',
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.api.restoreCustomer(customerId).subscribe({
          next: () => {
            this.load();
          },
          error: (err) => {
            console.error(err);
            this.errorMsg = 'Error restoring customer';
          },
        });
      }
    });
  }

  // Removed redundant handlePagination method

  private updatePagedCustomers(): void {
    this.customerPager.page = this.paginationUtils.getSafePage(this.customerPager.page, this.filteredCustomers.length, this.customerPager.limit);
    this.pagedCustomers = this.paginationUtils.getPaginatedData(
      this.filteredCustomers,
      this.customerPager.page,
      this.customerPager.limit
    );
    this.cdr.markForCheck();
  }

  // ========================
  // REVIEWS
  // ========================

  private getReviewRestaurantRecord(review: IReview): Record<string, unknown> | null {
    const raw = review.restaurant_id as unknown;
    if (!raw || typeof raw !== 'object') {
      return null;
    }
    return raw as Record<string, unknown>;
  }

  private getReviewRestaurantId(review: IReview): string {
    const raw = review.restaurant_id as unknown;
    if (typeof raw === 'string') {
      return raw;
    }

    const record = this.getReviewRestaurantRecord(review);
    const candidate = record?.['_id'];
    return typeof candidate === 'string' ? candidate : '';
  }

  getReviewRestaurantName(review: IReview): string {
    const raw = review.restaurant_id as unknown;
    if (typeof raw === 'string') {
      const restaurant = this.restaurants.find((r) => r._id === raw);
      return restaurant?.profile?.name ?? 'Restaurant';
    }

    const record = this.getReviewRestaurantRecord(review);
    const profile = record?.['profile'] as Record<string, unknown> | undefined;
    const profileName = profile?.['name'];
    if (typeof profileName === 'string' && profileName.trim().length > 0) {
      return profileName;
    }

    const recordName = record?.['name'];
    if (typeof recordName === 'string' && recordName.trim().length > 0) {
      return recordName;
    }

    return 'Restaurant';
  }

  loadReviews(customerId: string): void {
    this.reviewService.getByCustomer(customerId).subscribe({
      next: (data: { data: IReview[]; total: number }) => {
        const allReviews = data.data ?? [];

        let filtered = this.filterReviews(allReviews);
        let sorted = this.sortReviews(filtered);

        this.reviewTotal[customerId] = sorted.length;
        this.reviewPage[customerId] = this.paginationUtils.getSafePage(
          this.reviewPage[customerId] || 1,
          sorted.length,
          this.reviewLimit
        );
        this.reviewsByCustomer[customerId] = this.paginationUtils.getPaginatedData(
          sorted,
          this.reviewPage[customerId],
          this.reviewLimit
        );

        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error loading reviews:', err);
        this.reviewsByCustomer[customerId] = [];
        this.cdr.markForCheck();
      },
    });
  }

  private filterReviews(reviews: IReview[]): IReview[] {
    if (!this.minGlobalRatingFilter) {
      return reviews;
    }
    return reviews.filter((r) => r.globalRating >= this.minGlobalRatingFilter!);
  }

  private sortReviews(reviews: IReview[]): IReview[] {
    if (!this.sortByLikes) {
      return reviews;
    }
    return [...reviews].sort((a, b) => (b.likes || 0) - (a.likes || 0));
  }

  openReviewForm(customerId: string): void {
    this.selectedCustomerId = customerId;
    this.editingReviewId = null;
    this.resetReviewForm();
  }

  private resetReviewForm(): void {
    this.reviewForm.reset({
      restaurant_id: '',
      globalRating: null,
      comment: '',
      ratings: {
        foodQuality: null,
        staffService: null,
        cleanliness: null,
        environment: null,
      },
    });
    this.clearFormArray(this.imagesControls);
  }

  editReview(review: IReview): void {
    const customerId = review.customer_id;

    this.selectedCustomerId = customerId;
    this.editingReviewId = review._id!;
    this.expanded[customerId] = true;

    const images = Array.isArray(review.images) ? review.images : [];

    this.reviewForm.patchValue({
      restaurant_id: this.getReviewRestaurantId(review),
      globalRating: review.globalRating,
      comment: review.comment ?? '',
      ratings: {
        foodQuality: review.ratings?.foodQuality ?? null,
        staffService: review.ratings?.staffService ?? null,
        cleanliness: review.ratings?.cleanliness ?? null,
        environment: review.ratings?.environment ?? null,
      },
    });

    this.clearFormArray(this.imagesControls);
    images.forEach((url) => this.addImage(url));
  }

  private buildReviewPayload(): {
    restaurant_id: string;
    globalRating: number;
    comment: string;
    ratings: {
      foodQuality: number;
      staffService: number;
      cleanliness: number;
      environment: number;
    };
    images: string[];
  } {
    const formValue = this.reviewForm.value;
    const ratingValues = formValue.ratings ?? {};

    return {
      restaurant_id: String(formValue.restaurant_id ?? ''),
      globalRating: Number(formValue.globalRating),
      comment: String(formValue.comment ?? ''),
      ratings: {
        foodQuality: Number(ratingValues.foodQuality ?? 0),
        staffService: Number(ratingValues.staffService ?? 0),
        cleanliness: Number(ratingValues.cleanliness ?? 0),
        environment: Number(ratingValues.environment ?? 0),
      },
      images: (formValue.images ?? [])
        .map((url: string) => String(url ?? '').trim())
        .filter((url: string) => url.length > 0),
    };
  }

  saveReview(): void {
    if (this.reviewForm.invalid || !this.selectedCustomerId) return;

    const reviewPayload = this.buildReviewPayload();

    if (this.editingReviewId) {
      this.reviewService.update(this.editingReviewId, reviewPayload).subscribe({
        next: () => {
          this.finishReviewAction();
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Error updating review:', err);
          alert('Error updating review');
          this.cdr.markForCheck();
        },
      });
      return;
    }

    const restaurantId = reviewPayload.restaurant_id;
    const exists = this.reviewsByCustomer[this.selectedCustomerId]?.find(
      (r) => this.getReviewRestaurantId(r) === restaurantId,
    );

    if (exists) {
      alert('Already reviewed this restaurant');
      return;
    }

    const data = {
      ...reviewPayload,
      customer_id: this.selectedCustomerId,
      date: new Date(),
    };

    this.reviewService.create(data).subscribe({
      next: () => {
        this.finishReviewAction();
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error creating review:', err);
        alert('Error creating review: ' + (err.error?.message || 'Please try again'));
        this.cdr.markForCheck();
      },
    });
  }

  finishReviewAction(): void {
    const id = this.selectedCustomerId;
    this.resetReviewForm();
    this.selectedCustomerId = null;
    this.editingReviewId = null;
    if (id) this.loadReviews(id);
  }

  deleteReview(reviewId: string, customerId: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: 'Delete this review?',
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.reviewService.softDelete(reviewId).subscribe(() => this.loadReviews(customerId));
      }
    });
  }

  getStars(globalRating: number): number[] {
    return Array(globalRating).fill(0);
  }

  goToReviewPage(customerId: string): void {
    const requestedPage = Number(this.goToReviewPageControl.value);
    this.reviewPage[customerId] = this.paginationUtils.getSafePage(requestedPage, this.reviewTotal[customerId] || 0, this.reviewLimit);
    this.goToReviewPageControl.setValue(this.reviewPage[customerId], { emitEvent: false });
    this.loadReviews(customerId);
  }

  // ========================
  // VISITS
  // ========================

  loadVisits(customerId: string): void {
    this.visitService.getVisitsByCustomerId(customerId).subscribe({
      next: (allVisits: IVisit[]) => {
        let filtered = this.filterVisits(allVisits);
        let sorted = this.sortVisits(filtered);

        this.visitTotal[customerId] = sorted.length;
        this.visitPage[customerId] = this.paginationUtils.getSafePage(
          this.visitPage[customerId] || 1,
          sorted.length,
          this.visitLimit
        );
        this.customerVisits[customerId] = this.paginationUtils.getPaginatedData(
          sorted,
          this.visitPage[customerId],
          this.visitLimit
        );

        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error loading visits:', err);
        this.customerVisits[customerId] = [];
        this.cdr.markForCheck();
      },
    });
  }

  private filterVisits(visits: IVisit[]): IVisit[] {
    return visits;
  }

  private sortVisits(visits: IVisit[]): IVisit[] {
    return [...visits].sort((a, b) => {
      let aVal = a[this.visitSortField];
      let bVal = b[this.visitSortField];

      if (aVal === undefined || aVal === null) aVal = '';
      if (bVal === undefined || bVal === null) bVal = '';

      if (this.visitSortField === 'date') {
        const aTime = new Date(aVal as string | number).getTime();
        const bTime = new Date(bVal as string | number).getTime();
        return this.visitSortOrder === 'asc' ? aTime - bTime : bTime - aTime;
      }

      if (aVal < bVal) return this.visitSortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return this.visitSortOrder === 'asc' ? 1 : -1;

      return 0;
    });
  }

  prepareNewVisit(customerId: string): void {
    this.currentCustomerId = customerId;
    this.isEditingVisit = false;
    this.activeVisitForm = true;
    this.visitForm.reset({
      date: new Date().toISOString().substring(0, 10),
      billAmount: 0,
      pointsEarned: 0,
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
      date: formattedDate,
    });
  }

  saveVisit(): void {
    if (this.visitForm.invalid) return;
    const formValue = this.visitForm.value;

    if (this.isEditingVisit && this.selectedVisitId) {
      const updatePayload = {
        date: formValue.date,
        pointsEarned: Number(formValue.pointsEarned),
        billAmount: Number(formValue.billAmount),
      };
      this.visitService.updateVisit(this.selectedVisitId, updatePayload).subscribe({
        next: () => {
          this.loadVisits(this.currentCustomerId!);
          this.cancelVisitForm();
        },
        error: (err) => alert('Error al actualizar: ' + (err.error?.message || 'Revisa Joi')),
      });
    } else {
      const createPayload = {
        customer_id: this.currentCustomerId,
        restaurant_id: formValue.restaurant_id,
        date: formValue.date,
        pointsEarned: Number(formValue.pointsEarned),
        billAmount: Number(formValue.billAmount),
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
        error: (err) => console.error('Error en Soft Delete:', err),
      });
    }
  }

  deleteVisit(visitId: string, customerId: string): void {
    if (confirm('¿Seguro que quieres borrar permanentemente (Hard Delete)?')) {
      this.visitService.softDeleteVisit(visitId).subscribe(() => {
        this.loadVisits(customerId);
      });
    }
  }

  cancelVisitForm(): void {
    this.activeVisitForm = false;
    this.selectedVisitId = null;
    this.visitForm.reset();
  }

  toggleVisitsExpand(customerId: string): void {
    this.visitsExpanded[customerId] = !this.visitsExpanded[customerId];

    if (this.visitsExpanded[customerId]) {
      this.visitPage[customerId] = 1; // Initialize page to 1
      this.loadVisits(customerId);
    }
  }

  setVisitSort(field: 'date' | 'billAmount' | 'pointsEarned', customerId: string): void {
    if (this.visitSortField === field) {
      this.visitSortOrder = this.visitSortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.visitSortField = field;
      this.visitSortOrder = 'desc';
    }
    this.loadVisits(customerId);
  }

  getVisitsByCustomer(customerId: string): IVisit[] {
    return this.customerVisits[customerId] || [];
  }

  goToVisitPage(customerId: string): void {
    const requestedPage = Number(this.goToVisitPageControl.value);
    this.visitPage[customerId] = this.paginationUtils.getSafePage(requestedPage, this.visitTotal[customerId] || 0, this.visitLimit);
    this.goToVisitPageControl.setValue(this.visitPage[customerId], { emitEvent: false });
    this.loadVisits(customerId);
  }

  // ========================
  // BADGES
  // ========================

  loadCustomerBadges(customerId: string): void {
    this.loadingBadges[customerId] = true;
    this.badgeService.getBadgesByCustomer(customerId).subscribe({
      next: (badges: IBadge[]) => {
        this.customerBadges[customerId] = badges;
        this.loadingBadges[customerId] = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.customerBadges[customerId] = [];
        this.loadingBadges[customerId] = false;
        this.cdr.markForCheck();
      },
    });
  }

  // ========================
  // PAGINATION METHODS FOR TEMPLATE
  // ========================

  prevVisitPage(customerId: string): void {
    this.visitPage[customerId] = this.paginationUtils.getSafePage((this.visitPage[customerId] || 1) - 1, this.visitTotal[customerId] || 0, this.visitLimit);
    this.loadVisits(customerId);
  }

  nextVisitPage(customerId: string): void {
    this.visitPage[customerId] = this.paginationUtils.getSafePage((this.visitPage[customerId] || 1) + 1, this.visitTotal[customerId] || 0, this.visitLimit);
    this.loadVisits(customerId);
  }

  prevPage(customerId: string): void { // For reviews
    this.reviewPage[customerId] = this.paginationUtils.getSafePage((this.reviewPage[customerId] || 1) - 1, this.reviewTotal[customerId] || 0, this.reviewLimit);
    this.loadReviews(customerId);
  }

  nextPage(customerId: string): void { // For reviews
    this.reviewPage[customerId] = this.paginationUtils.getSafePage((this.reviewPage[customerId] || 1) + 1, this.reviewTotal[customerId] || 0, this.reviewLimit);
    this.loadReviews(customerId);
  }

  prevCustomersPage(): void {
    this.customerPager.page = this.paginationUtils.getSafePage(this.customerPager.page - 1, this.filteredCustomers.length, this.customerPager.limit);
    this.updatePagedCustomers();
  }

  nextCustomersPage(): void {
    this.customerPager.page = this.paginationUtils.getSafePage(this.customerPager.page + 1, this.filteredCustomers.length, this.customerPager.limit);
    this.updatePagedCustomers();
  }

  prevDeletedPage(): void {
    this.deletedPager.page = this.paginationUtils.getSafePage(this.deletedPager.page - 1, this.filteredDeletedCustomers.length, this.deletedPager.limit);
    this.updatePagedDeletedCustomers();
  }

  nextDeletedPage(): void {
    this.deletedPager.page = this.paginationUtils.getSafePage(this.deletedPager.page + 1, this.filteredDeletedCustomers.length, this.deletedPager.limit);
    this.updatePagedDeletedCustomers();
  }
}
