import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { RestaurantService } from '../services/restaurant.service';
import { RewardService } from '../services/reward.service';
import { VisitService } from '../services/visit.service';
import { DishService } from '../services/dish.service';
import { EmployeeService } from '../services/employee.service';
import { ReviewService } from '../services/review.service';
import { IRestaurant } from '../models/restaurant.model';
import { IReward } from '../models/reward.model';
import { IVisit } from '../models/visit.model';
import { IDish } from '../models/dish.model';
import { IEmployee } from '../models/employee.model';
import { IBadge } from '../models/badge.model';
import { BadgeService } from '../services/badge.service';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog';
import { ICustomer } from '../models/customer.model';
import { CustomerService } from '../services/customer.service';
import { PaginationUtils } from '../services/pagination.util';
import { environment } from '../../environments/environment';
import {
  buildGoogleMapsDirectionsUrl,
  buildGoogleMapsEmbedUrl,
  buildGoogleMapsOpenUrl,
  GoogleLocationData,
  hasAnyLocationData,
  isValidCoordinates,
} from '../utils/google-maps.util';

@Component({
  selector: 'app-restaurant-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule],
  templateUrl: './restaurant-list.html',
  styleUrls: ['./restaurant-list.css'],
})
export class RestaurantList implements OnInit, OnDestroy {
  Math = Math;

  restaurants: IRestaurant[] = [];
  deletedRestaurants: IRestaurant[] = [];
  customers: ICustomer[] = [];
  filteredRestaurants: IRestaurant[] = [];
  filteredDeletedRestaurants: IRestaurant[] = [];
  pagedRestaurants: IRestaurant[] = [];
  pagedDeletedRestaurants: IRestaurant[] = [];
  searchControl = new FormControl('');
  searchDeletedControl = new FormControl('');
  search: boolean = false;
  searchDeleted: boolean = false;
  loading: boolean = true;
  errorMsg: string = '';
  showForm = false;
  restaurantForm!: FormGroup;
  editting = false;
  restaurantEditId: string | undefined;
  expanded: { [key: string]: boolean } = {};
  restaurantFull: { [key: string]: IRestaurant } = {};
  deletedRestaurantFull: { [key: string]: IRestaurant } = {};
  restaurantPager = { page: 1, limit: 3 };
  deletedPager = { page: 1, limit: 3 };
  showAllRestaurants = false;
  showAllDeletedRestaurants = false;
  showAllData = false;
  showDeletedAllData: boolean = false;
  goToPageControl = new FormControl<number | null>(1);
  goToDeletedPageControl = new FormControl<number | null>(1);

  restaurantRewards: { [key: string]: IReward[] } = {};
  showRewardForm: { [key: string]: boolean } = {};
  newRewardForm!: FormGroup;
  editingRewardId: string | null = null;
  editRewardForm!: FormGroup;
  rewardPage: { [restaurantId: string]: number } = {};
  rewardTotal: { [key: string]: number } = {};
  rewardLimit = 2;
  rewardExpanded: { [restaurantId: string]: boolean } = {};
  goToRewardPageControl = new FormControl<number | null>(1);

  restaurantVisits: { [key: string]: IVisit[] } = {};
  showVisitForm: { [key: string]: boolean } = {};
  newVisitForm!: FormGroup;
  editingVisitId: string | null = null;
  editVisitForm!: FormGroup;
  loadingCustomers: boolean = false;
  visitPage: { [restaurantId: string]: number } = {};
  visitTotal: { [key: string]: number } = {};
  visitLimit = 2;
  visitsExpanded: { [restaurantId: string]: boolean } = {};
  goToVisitPageControl = new FormControl<number | null>(1);

  restaurantDishes: { [key: string]: IDish[] } = {};
  showDishForm: { [key: string]: boolean } = {};
  newDishForm!: FormGroup;
  editingDishId: string | null = null;
  editDishForm!: FormGroup;
  dishPage: { [restaurantId: string]: number } = {};
  dishTotal: { [key: string]: number } = {};
  dishLimit = 5;
  goToDishPageControl = new FormControl<number | null>(1);
  topDishByRestaurant: { [key: string]: IDish | null } = {};
  topDishState: { [key: string]: 'idle' | 'loading' | 'success' | 'empty' | 'error' } = {};
  topDishErrorText: { [key: string]: string } = {};

  restaurantEmployees: { [key: string]: IEmployee[] } = {};
  showEmployeeForm: { [key: string]: boolean } = {};
  newEmployeeForm!: FormGroup;
  editingEmployeeId: string | null = null;
  editEmployeeForm!: FormGroup;
  employeePage: { [restaurantId: string]: number } = {};
  employeeTotal: { [key: string]: number } = {};
  employeeLimit = 6;
  goToEmployeePageControl = new FormControl<number | null>(1);

  restaurantBadges: { [key: string]: IBadge[] } = {};
  showBadgeForm: { [key: string]: boolean } = {};
  newBadgeForm!: FormGroup;
  editingBadgeId: string | null = null;
  editBadgeForm!: FormGroup;
  badgePage: { [restaurantId: string]: number } = {};
  badgeTotal: { [key: string]: number } = {};
  badgeLimit = 5;
  goToBadgePageControl = new FormControl<number | null>(1);
  mapEmbedUrl: { [key: string]: SafeResourceUrl | null } = {};
  mapOpenUrl: { [key: string]: string } = {};
  mapDirectionsUrl: { [key: string]: string } = {};
  mapLoading: { [key: string]: boolean } = {};
  mapLoadError: { [key: string]: boolean } = {};

  constructor(
    private api: RestaurantService,
    private rewardApi: RewardService,
    private visitApi: VisitService,
    private dishApi: DishService,
    private reviewApi: ReviewService,
    private employeeApi: EmployeeService,
    private badgeApi: BadgeService,
    private customerApi: CustomerService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private sanitizer: DomSanitizer,
    private paginationUtils: PaginationUtils,
  ) {
    this.restaurantForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(120)]],
      description: [
        '',
        [Validators.required, Validators.minLength(10), Validators.maxLength(2000)],
      ],
      categoryItalià: [false],
      categoryJaponès: [false],
      categorySushi: [false],
      categoryMexicà: [false],
      categoryXinès: [false],
      categoryIndi: [false],
      categoryTailandès: [false],
      categoryFrancès: [false],
      categoryEspanyol: [false],
      categoryGrec: [false],
      categoryTurc: [false],
      categoryCoreà: [false],
      categoryVietnamita: [false],
      categoryAlemany: [false],
      categoryBrasileny: [false],
      categoryPeruà: [false],
      categoryVegà: [false],
      categoryVegetarià: [false],
      categoryMarisc: [false],
      categoryCarn: [false],
      categoryPizzeria: [false],
      categoryCafeteria: [false],
      categoryRamen: [false],
      categoryGlutenFree: [false],
      categoryGourmet: [false],
      categoryFastFood: [false],
      categoryBuffet: [false],
      categoryFoodTruck: [false],
      categoryLounge: [false],
      categoryPub: [false],
      categoryWineBar: [false],
      categoryRooftop: [false],
      categoryBar: [false],
      categoryTaperia: [false],
      categoryGelateria: [false],
      categoryEstrellaMichelin: [false],
      categoryStreetFood: [false],
      globalRating: [
        0,
        [Validators.pattern('^[0-5]+(\\.[0-9]+)?$'), Validators.min(0), Validators.max(5)],
      ],
      monday: [
        '',
        [
          Validators.pattern(
            '(?:[01]\\d|2[0-3]):[0-5]\\d-(?:[01]\\d|2[0-3]):[0-5]\\d(?:,(?:[01]\\d|2[0-3]):[0-5]\\d-(?:[01]\\d|2[0-3]):[0-5]\\d)*',
          ),
        ],
      ],
      tuesday: [
        '',
        [
          Validators.pattern(
            '(?:[01]\\d|2[0-3]):[0-5]\\d-(?:[01]\\d|2[0-3]):[0-5]\\d(?:,(?:[01]\\d|2[0-3]):[0-5]\\d-(?:[01]\\d|2[0-3]):[0-5]\\d)*',
          ),
        ],
      ],
      wednesday: [
        '',
        [
          Validators.pattern(
            '(?:[01]\\d|2[0-3]):[0-5]\\d-(?:[01]\\d|2[0-3]):[0-5]\\d(?:,(?:[01]\\d|2[0-3]):[0-5]\\d-(?:[01]\\d|2[0-3]):[0-5]\\d)*',
          ),
        ],
      ],
      thursday: [
        '',
        [
          Validators.pattern(
            '(?:[01]\\d|2[0-3]):[0-5]\\d-(?:[01]\\d|2[0-3]):[0-5]\\d(?:,(?:[01]\\d|2[0-3]):[0-5]\\d-(?:[01]\\d|2[0-3]):[0-5]\\d)*',
          ),
        ],
      ],
      friday: [
        '',
        [
          Validators.pattern(
            '(?:[01]\\d|2[0-3]):[0-5]\\d-(?:[01]\\d|2[0-3]):[0-5]\\d(?:,(?:[01]\\d|2[0-3]):[0-5]\\d-(?:[01]\\d|2[0-3]):[0-5]\\d)*',
          ),
        ],
      ],
      saturday: [
        '',
        [
          Validators.pattern(
            '(?:[01]\\d|2[0-3]):[0-5]\\d-(?:[01]\\d|2[0-3]):[0-5]\\d(?:,(?:[01]\\d|2[0-3]):[0-5]\\d-(?:[01]\\d|2[0-3]):[0-5]\\d)*',
          ),
        ],
      ],
      sunday: [
        '',
        [
          Validators.pattern(
            '(?:[01]\\d|2[0-3]):[0-5]\\d-(?:[01]\\d|2[0-3]):[0-5]\\d(?:,(?:[01]\\d|2[0-3]):[0-5]\\d-(?:[01]\\d|2[0-3]):[0-5]\\d)*',
          ),
        ],
      ],
      imageUrl: ['', Validators.pattern('^http[^,\\s]*(,http[^,\\s]*)*$')],
      phone: [''],
      email: [''],
      city: ['', Validators.required],
      address: [''],
      googlePlaceId: [''],
      type: ['', Validators.required],
      lon: ['', Validators.required],
      lat: ['', Validators.required],
      employees: [''],
      dishes: [''],
      statistics: [''],
      badges: [''],
    });

    this.newRewardForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      pointsRequired: [0, [Validators.min(0)]],
    });

    this.editRewardForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      pointsRequired: [0, [Validators.min(0)]],
    });

    this.newVisitForm = this.fb.group({
      customer_id: ['', Validators.required],
      date: [new Date().toISOString().substring(0, 16), Validators.required],
      billAmount: [0, [Validators.min(0)]],
      pointsEarned: [0, [Validators.min(0)]],
    });

    this.editVisitForm = this.fb.group({
      date: ['', Validators.required],
      billAmount: [0, [Validators.min(0)]],
      pointsEarned: [0, [Validators.min(0)]],
    });

    this.newDishForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      section: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      active: [true],
      availableAtBreakfast: [false],
      availableAtBrunch: [false],
      availableAtLunch: [false],
      availableAtHappyHour: [false],
      availableAtDinner: [false],
      availableAtAllDay: [false],
      portionSize: [''],
    });

    this.editDishForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      section: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      active: [true],
      availableAtBreakfast: [false],
      availableAtBrunch: [false],
      availableAtLunch: [false],
      availableAtHappyHour: [false],
      availableAtDinner: [false],
      availableAtAllDay: [false],
      portionSize: [''],
    });

    this.newEmployeeForm = this.fb.group({
      name: ['', Validators.required],
      email: [''],
      phone: [''],
      role: ['staff'],
      password: [''],
      isActive: [true],
    });

    this.editEmployeeForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.email]],
      phone: [''],
      role: ['staff'],
      isActive: [true],
    });

    this.newBadgeForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      type: ['achievement', Validators.required],
    });

    this.editBadgeForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      type: ['achievement', Validators.required],
    });
  }

  ngOnInit(): void {
    this.load();

    this.searchControl.valueChanges.subscribe((value) => {
      const term = value?.toLowerCase() ?? '';
      term ? (this.search = true) : (this.search = false);
      this.filteredRestaurants = this.restaurants.filter((restaurant) =>
        restaurant.profile.name.toLowerCase().includes(term),
      );
      this.restaurantPager.page = 1;
      this.updatePagedRestaurants();
    });

    this.searchDeletedControl.valueChanges.subscribe((value) => {
      const term = value?.toLowerCase() ?? '';
      term ? (this.searchDeleted = true) : (this.searchDeleted = false);
      this.filteredDeletedRestaurants = this.deletedRestaurants.filter((restaurant) =>
        restaurant.profile.name.toLowerCase().includes(term),
      );
      this.deletedPager.page = 1;
      this.updatePagedDeletedRestaurants();
    });
  }

  ngOnDestroy(): void {
    this.mapEmbedUrl = {};
    this.mapOpenUrl = {};
    this.mapDirectionsUrl = {};
    this.mapLoading = {};
    this.mapLoadError = {};
  }

  load(): void {
    this.loading = true;
    this.errorMsg = '';
    this.cdr.markForCheck();

    this.api.getRestaurants().subscribe({
      next: (res: any) => {
        const data = res ?? [];
        this.restaurants = data;
        this.filteredRestaurants = [...data];
        this.updatePagedRestaurants();
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.errorMsg = 'Could not load restaurants.';
        this.loading = false;
        this.cdr.markForCheck();
      },
    });

    this.api.getDeletedRestaurants().subscribe({
      next: (res: any) => {
        const data = res ?? [];
        this.deletedRestaurants = data;
        this.filteredDeletedRestaurants = [...data];
        this.updatePagedDeletedRestaurants();
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.errorMsg = 'Could not load deleted restaurants.';
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  trackById(_index: number, restaurant: IRestaurant): string | undefined {
    return restaurant._id;
  }

  toggleShowForm(): void {
    if (this.editting) {
      this.showForm = true;
      this.editting = false;
    } else {
      this.showForm = !this.showForm;
    }
  }

  showMore(): void {
    this.showAllRestaurants = true;
  }

  get visibleRestaurants(): IRestaurant[] {
    if (this.search) {
      return this.filteredRestaurants;
    }
    return this.pagedRestaurants;
  }

  get visibleDeletedRestaurants(): IRestaurant[] {
    if (this.searchDeleted) {
      return this.filteredDeletedRestaurants;
    }
    return this.pagedDeletedRestaurants;
  }

  private refreshRestaurantFull(restaurantId: string) {
    this.api.getRestaurantFull(restaurantId).subscribe({
      next: (full) => {
        this.restaurantFull[restaurantId] = full;
        this.initializeLocationMapState(restaurantId, full);
        this.cdr.markForCheck();
      },
      error: () => {
        this.errorMsg = 'Could not load full restaurant data.';
        this.cdr.markForCheck();
      },
    });
  }

  toggleExpand(restaurantId: string): void {
    this.expanded[restaurantId] = !this.expanded[restaurantId];

    if (this.expanded[restaurantId]) {
      this.refreshRestaurantFull(restaurantId);

      this.rewardPage[restaurantId] = 1;
      this.loadRestaurantRewards(restaurantId);

      this.visitPage[restaurantId] = 1;
      this.loadRestaurantVisits(restaurantId);

      this.dishPage[restaurantId] = 1;
      this.loadRestaurantTopDish(restaurantId);
      this.loadRestaurantDishes(restaurantId);

      this.employeePage[restaurantId] = 1;
      this.loadRestaurantEmployees(restaurantId);

      this.badgePage[restaurantId] = 1;
      this.loadRestaurantBadges(restaurantId);
    } else {
      this.mapLoading[restaurantId] = false;
    }
  }

  private normalizeTopDishResponse(dish: IDish | null | undefined): IDish | null {
    if (!dish) {
      return null;
    }

    const hasName = typeof dish.name === 'string' && dish.name.trim().length > 0;
    if (!hasName) {
      return null;
    }

    return dish;
  }

  private loadRestaurantTopDish(restaurantId: string): void {
    this.topDishState[restaurantId] = 'loading';
    this.topDishErrorText[restaurantId] = '';
    this.cdr.markForCheck();

    this.reviewApi.getTopDish(restaurantId).subscribe({
      next: (res: IDish | null) => {
        const topDish = this.normalizeTopDishResponse(res);
        if (!topDish) {
          this.topDishByRestaurant[restaurantId] = null;
          this.topDishState[restaurantId] = 'empty';
        } else {
          this.topDishByRestaurant[restaurantId] = topDish;
          this.topDishState[restaurantId] = 'success';
        }
        this.cdr.markForCheck();
      },
      error: (error: HttpErrorResponse) => {
        if (error.status === 404) {
          this.topDishByRestaurant[restaurantId] = null;
          this.topDishState[restaurantId] = 'empty';
          this.topDishErrorText[restaurantId] = '';
        } else {
          this.topDishState[restaurantId] = 'error';
          this.topDishErrorText[restaurantId] = 'Could not load top rated dish.';
        }
        this.cdr.markForCheck();
      },
    });
  }

  retryTopDishLoad(restaurantId: string): void {
    this.loadRestaurantTopDish(restaurantId);
  }

  getTopDishState(restaurantId: string): 'idle' | 'loading' | 'success' | 'empty' | 'error' {
    return this.topDishState[restaurantId] ?? 'idle';
  }

  getTopDish(restaurantId: string ): IDish | null {
    return this.topDishByRestaurant[restaurantId] ?? null;
  }

  formatTopDishRating(rating: number | null | undefined): string {
    if (rating === null || rating === undefined || !Number.isFinite(rating)) {
      return '—';
    }
    const fixed = Number(rating.toFixed(2));
    return fixed.toString();
  }

  formatTopDishVotes(count: number | null | undefined): string {
    if (count === null || count === undefined || !Number.isFinite(count)) {
      return '— valoraciones';
    }
    const safeCount = Math.max(0, Math.trunc(count));
    return `${safeCount} valoraciones`;
  }

  private getLocationData(restaurant: IRestaurant): GoogleLocationData {
    return {
      city: restaurant.profile.location?.city,
      address: restaurant.profile.location?.address,
      googlePlaceId: restaurant.profile.location?.googlePlaceId,
      coordinates: restaurant.profile.location?.coordinates?.coordinates,
    };
  }

  hasLocationData(restaurant: IRestaurant): boolean {
    return hasAnyLocationData(this.getLocationData(restaurant));
  }

  hasCoordinates(restaurant: IRestaurant): boolean {
    return isValidCoordinates(this.getLocationData(restaurant).coordinates);
  }

  getLocationText(restaurant: IRestaurant): string {
    const location = this.getLocationData(restaurant);
    return [location.address, location.city].filter(Boolean).join(', ') || 'Location available';
  }

  getMapEmbedUrl(restaurantId: string): SafeResourceUrl | null {
    return this.mapEmbedUrl[restaurantId] ?? null;
  }

  getOpenMapsUrl(restaurantId: string): string {
    return this.mapOpenUrl[restaurantId] ?? '';
  }

  getDirectionsUrl(restaurantId: string): string {
    return this.mapDirectionsUrl[restaurantId] ?? '';
  }

  onMapFrameLoad(restaurantId: string): void {
    this.mapLoading[restaurantId] = false;
    this.mapLoadError[restaurantId] = false;
    this.cdr.markForCheck();
  }

  onMapFrameError(restaurantId: string): void {
    this.mapLoading[restaurantId] = false;
    this.mapLoadError[restaurantId] = true;
    this.cdr.markForCheck();
  }

  private initializeLocationMapState(restaurantId: string, restaurant: IRestaurant): void {
    const location = this.getLocationData(restaurant);

    this.mapOpenUrl[restaurantId] = buildGoogleMapsOpenUrl(location);
    this.mapDirectionsUrl[restaurantId] = buildGoogleMapsDirectionsUrl(location);

    if (!hasAnyLocationData(location)) {
      this.mapEmbedUrl[restaurantId] = null;
      this.mapLoading[restaurantId] = false;
      this.mapLoadError[restaurantId] = false;
      return;
    }

    const embedUrl = buildGoogleMapsEmbedUrl(location, environment.googleMapsEmbedApiKey);
    this.mapEmbedUrl[restaurantId] = embedUrl
      ? this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl)
      : null;

    this.mapLoading[restaurantId] = this.hasCoordinates(restaurant) && Boolean(embedUrl);
    this.mapLoadError[restaurantId] = false;
  }

  private refreshDeletedRestaurantFull(restaurantId: string) {
    this.api.getDeletedRestaurantFull(restaurantId).subscribe({
      next: (full) => {
        this.deletedRestaurantFull[restaurantId] = full;
        this.cdr.markForCheck();
      },
      error: () => {
        this.errorMsg = 'Could not load full deleted restaurant data.';
        this.cdr.markForCheck();
      },
    });
  }

  toggleExpandDeleted(restaurantId: string): void {
    this.expanded[restaurantId] = !this.expanded[restaurantId];

    if (this.expanded[restaurantId]) {
      this.refreshDeletedRestaurantFull(restaurantId);

      this.rewardPage[restaurantId] = 1;
      this.loadRestaurantRewards(restaurantId);

      this.visitPage[restaurantId] = 1;
      this.loadRestaurantVisits(restaurantId);

      this.dishPage[restaurantId] = 1;
      this.loadRestaurantDishes(restaurantId);

      this.employeePage[restaurantId] = 1;
      this.loadRestaurantEmployees(restaurantId);

      this.badgePage[restaurantId] = 1;
      this.loadRestaurantBadges(restaurantId);
    }
  }

  restoreRestaurant(restaurantId: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: 'restore this restaurant',
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loading = true;
        this.cdr.markForCheck();
        this.api.restoreRestaurant(restaurantId).subscribe({
          next: () => this.load(),
          error: () => {
            this.errorMsg = 'Could not restore restaurant.';
            this.loading = false;
            this.cdr.markForCheck();
          },
        });
      }
    });
  }

  private formatRelationValue(value: unknown): string {
    if (Array.isArray(value)) {
      return value
        .map((item) => {
          if (typeof item === 'string') return item;
          if (item && typeof item === 'object') {
            const record = item as Record<string, unknown>;
            return String(record['_id'] ?? '');
          }
          return '';
        })
        .filter(Boolean)
        .join(', ');
    }

    if (value && typeof value === 'object') {
      const record = value as Record<string, unknown>;
      return String(record['_id'] ?? '');
    }

    return value != null ? String(value) : '';
  }

  private patchRestaurantForm(restaurant: IRestaurant): void {
    const coordinates = restaurant.profile.location?.coordinates?.coordinates ?? [];

    this.restaurantForm.patchValue({
      name: restaurant.profile.name,
      description: restaurant.profile.description,
      globalRating: restaurant.profile.globalRating,
      categoryItalià: restaurant.profile.category?.includes('Italià'),
      categoryJaponès: restaurant.profile.category?.includes('Japonès'),
      categorySushi: restaurant.profile.category?.includes('Sushi'),
      categoryMexicà: restaurant.profile.category?.includes('Mexicà'),
      categoryXinès: restaurant.profile.category?.includes('Xinès'),
      categoryIndi: restaurant.profile.category?.includes('Indi'),
      categoryTailandès: restaurant.profile.category?.includes('Tailandès'),
      categoryFrancès: restaurant.profile.category?.includes('Francès'),
      categoryEspanyol: restaurant.profile.category?.includes('Espanyol'),
      categoryGrec: restaurant.profile.category?.includes('Grec'),
      categoryTurc: restaurant.profile.category?.includes('Turc'),
      categoryCoreà: restaurant.profile.category?.includes('Coreà'),
      categoryVietnamita: restaurant.profile.category?.includes('Vietnamita'),
      categoryAlemany: restaurant.profile.category?.includes('Alemany'),
      categoryBrasileny: restaurant.profile.category?.includes('Brasileny'),
      categoryPeruà: restaurant.profile.category?.includes('Peruà'),
      categoryVegà: restaurant.profile.category?.includes('Vegà'),
      categoryVegetarià: restaurant.profile.category?.includes('Vegetarià'),
      categoryMarisc: restaurant.profile.category?.includes('Marisc'),
      categoryCarn: restaurant.profile.category?.includes('Carn'),
      categoryPizzeria: restaurant.profile.category?.includes('Pizzeria'),
      categoryCafeteria: restaurant.profile.category?.includes('Cafeteria'),
      categoryRamen: restaurant.profile.category?.includes('Ramen'),
      categoryGlutenFree: restaurant.profile.category?.includes('Gluten Free'),
      categoryGourmet: restaurant.profile.category?.includes('Gourmet'),
      categoryFastFood: restaurant.profile.category?.includes('Fast Food'),
      categoryBuffet: restaurant.profile.category?.includes('Buffet'),
      categoryFoodTruck: restaurant.profile.category?.includes('Food Truck'),
      categoryLounge: restaurant.profile.category?.includes('Lounge'),
      categoryPub: 'Pub',
      categoryWineBar: restaurant.profile.category?.includes('Wine Bar'),
      categoryRooftop: restaurant.profile.category?.includes('Rooftop'),
      categoryBar: restaurant.profile.category?.includes('Bar'),
      categoryTaperia: restaurant.profile.category?.includes('Taperia'),
      categoryGelateria: restaurant.profile.category?.includes('Gelateria'),
      categoryEstrellaMichelin: restaurant.profile.category?.includes('Estrella Michelin'),
      categoryStreetFood: restaurant.profile.category?.includes('Street Food'),
      monday: restaurant.profile.timetable?.monday
        ? restaurant.profile.timetable.monday.map((s) => `${s.open}-${s.close}`).join(',')
        : '',
      tuesday: restaurant.profile.timetable?.tuesday
        ? restaurant.profile.timetable.tuesday.map((s) => `${s.open}-${s.close}`).join(',')
        : '',
      wednesday: restaurant.profile.timetable?.wednesday
        ? restaurant.profile.timetable.wednesday.map((s) => `${s.open}-${s.close}`).join(',')
        : '',
      thursday: restaurant.profile.timetable?.thursday
        ? restaurant.profile.timetable.thursday.map((s) => `${s.open}-${s.close}`).join(',')
        : '',
      friday: restaurant.profile.timetable?.friday
        ? restaurant.profile.timetable.friday.map((s) => `${s.open}-${s.close}`).join(',')
        : '',
      saturday: restaurant.profile.timetable?.saturday
        ? restaurant.profile.timetable.saturday.map((s) => `${s.open}-${s.close}`).join(',')
        : '',
      sunday: restaurant.profile.timetable?.sunday
        ? restaurant.profile.timetable.sunday.map((s) => `${s.open}-${s.close}`).join(',')
        : '',
      imageUrl: restaurant.profile.image?.join(',') ?? '',
      phone: restaurant.profile.contact?.phone ?? '',
      email: restaurant.profile.contact?.email ?? '',
      city: restaurant.profile.location?.city ?? '',
      address: restaurant.profile.location?.address ?? '',
      googlePlaceId: restaurant.profile.location?.googlePlaceId ?? '',
      type: restaurant.profile.location?.coordinates?.type ?? '',
      lat: coordinates[1] ?? '',
      lon: coordinates[0] ?? '',
      employees: this.formatRelationValue(restaurant.employees),
      dishes: this.formatRelationValue(restaurant.dishes),
      statistics: this.formatRelationValue(restaurant.statistics),
      badges: this.formatRelationValue(restaurant.badges),
    });
  }

  edit(restaurant: IRestaurant): void {
    this.showForm = true;
    this.editting = true;
    this.restaurantEditId = restaurant._id;
    this.patchRestaurantForm(restaurant);

    if (!restaurant._id) {
      return;
    }

    const fullRestaurant = this.restaurantFull[restaurant._id];
    if (fullRestaurant) {
      this.patchRestaurantForm(fullRestaurant);
      return;
    }

    this.loading = true;
    this.errorMsg = '';
    this.cdr.markForCheck();

    this.api.getRestaurantFull(restaurant._id).subscribe({
      next: (full) => {
        this.restaurantFull[restaurant._id!] = full;
        this.patchRestaurantForm(full);
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.patchRestaurantForm(restaurant);
        this.errorMsg = 'Could not load full restaurant data for editing.';
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  save(): void {
    if (this.restaurantForm.invalid) return;

    this.loading = true;
    this.errorMsg = '';
    this.cdr.markForCheck();

    const parseDay = (val: string): { open: string; close: string }[] | undefined =>
      val
        ? val.split(',').map((slot: string) => {
            const [open, close] = slot.split('-');
            return { open, close };
          })
        : undefined;

    const category: string[] = [];
    const cats: { [key: string]: string } = {
      categoryItalià: 'Italià',
      categoryJaponès: 'Japonès',
      categorySushi: 'Sushi',
      categoryMexicà: 'Mexicà',
      categoryXinès: 'Xinès',
      categoryIndi: 'Indi',
      categoryTailandès: 'Tailandès',
      categoryFrancès: 'Francès',
      categoryEspanyol: 'Espanyol',
      categoryGrec: 'Grec',
      categoryTurc: 'Turc',
      categoryCoreà: 'Coreà',
      categoryVietnamita: 'Vietnamita',
      categoryAlemany: 'Alemany',
      categoryBrasileny: 'Brasileny',
      categoryPeruà: 'Peruà',
      categoryVegà: 'Vegà',
      categoryVegetarià: 'Vegetarià',
      categoryMarisc: 'Marisc',
      categoryCarn: 'Carn',
      categoryPizzeria: 'Pizzeria',
      categoryCafeteria: 'Cafeteria',
      categoryRamen: 'Ramen',
      categoryGlutenFree: 'Gluten Free',
      categoryGourmet: 'Gourmet',
      categoryFastFood: 'Fast Food',
      categoryBuffet: 'Buffet',
      categoryFoodTruck: 'Food Truck',
      categoryLounge: 'Lounge',
      categoryPub: 'Pub',
      categoryWineBar: 'Wine Bar',
      categoryRooftop: 'Rooftop',
      categoryBar: 'Bar',
      categoryTaperia: 'Taperia',
      categoryGelateria: 'Gelateria',
      categoryEstrellaMichelin: 'Estrella Michelin',
      categoryStreetFood: 'Street Food',
    };
    Object.keys(cats).forEach((key) => {
      if (this.restaurantForm.value[key]) category.push(cats[key]);
    });

    if (category.length === 0) return;

    const v = this.restaurantForm.value;
    const newRestaurant: Partial<IRestaurant> = {
      profile: {
        timetable: {
          monday: parseDay(v.monday),
          tuesday: parseDay(v.tuesday),
          wednesday: parseDay(v.wednesday),
          thursday: parseDay(v.thursday),
          friday: parseDay(v.friday),
          saturday: parseDay(v.saturday),
          sunday: parseDay(v.sunday),
        },
        contact: {
          phone: v.phone || undefined,
          email: v.email || undefined,
        },
        location: {
          coordinates: {
            type: v.type || undefined,
            coordinates: [v.lon || undefined, v.lat || undefined],
          },
          city: v.city || undefined,
          address: v.address || undefined,
          googlePlaceId: v.googlePlaceId || undefined,
        },
        name: v.name,
        description: v.description,
        globalRating: v.globalRating,
        category,
        image: v.imageUrl ? v.imageUrl.split(',') : undefined,
      },
      employees: undefined,
      dishes: undefined,
      rewards: undefined,
      statistics: v.statistics || undefined,
      badges: undefined,
    };

    if (this.editting && this.restaurantEditId) {
      this.api.updateRestaurant(this.restaurantEditId, newRestaurant).subscribe({
        next: () => {
          this.resetForm();
          this.load();
        },
        error: (err) => {
          this.errorMsg = 'Could not update the restaurant.';
          console.error(err);
          this.loading = false;
          this.cdr.markForCheck();
        },
      });
    } else {
      this.api.createRestaurant(newRestaurant).subscribe({
        next: () => {
          this.resetForm();
          this.load();
        },
        error: (err) => {
          this.errorMsg = 'Could not create the restaurant.';
          console.error(err);
          this.loading = false;
          this.cdr.markForCheck();
        },
      });
    }
  }

  resetForm(): void {
    this.showForm = false;
    this.editting = false;
    this.restaurantEditId = undefined;
    this.restaurantForm.reset();
  }

  confirmDelete(id: string, name?: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: `soft delete the restaurant ${name}`,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) this.delete(id);
    });
  }

  delete(id: string): void {
    this.errorMsg = '';
    this.loading = true;
    this.cdr.markForCheck();

    this.api.softDeleteRestaurant(id).subscribe({
      next: () => this.load(),
      error: () => {
        this.errorMsg = 'Error delete';
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  // ========================
  // REWARDS
  // ========================

  private loadRestaurantRewards(restaurantId: string): void {
    this.rewardApi.getRewards().subscribe({
      next: (allRewards: IReward[]) => {
        const res: IReward[] = allRewards.filter(
          (reward: IReward) => reward.restaurant_id === restaurantId,
        );
        this.rewardTotal[restaurantId] = res.length;
        this.rewardPage[restaurantId] = this.paginationUtils.getSafePage(
          this.rewardPage[restaurantId] || 1,
          res.length,
          this.rewardLimit
        );
        this.restaurantRewards[restaurantId] = this.paginationUtils.getPaginatedData(
          res,
          this.rewardPage[restaurantId],
          this.rewardLimit
        );
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.restaurantRewards = { ...this.restaurantRewards, [restaurantId]: [] };
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  nextRewardPage(restaurantId: string): void {
    this.rewardPage[restaurantId] = this.paginationUtils.getSafePage((this.rewardPage[restaurantId] || 1) + 1, this.rewardTotal[restaurantId] || 0, this.rewardLimit);
    this.loadRestaurantRewards(restaurantId);
  }

  prevRewardPage(restaurantId: string): void {
    this.rewardPage[restaurantId] = this.paginationUtils.getSafePage((this.rewardPage[restaurantId] || 1) - 1, this.rewardTotal[restaurantId] || 0, this.rewardLimit);
    this.loadRestaurantRewards(restaurantId);
  }

  goToRewardPage(restaurantId: string): void {
    const requestedPage = Number(this.goToRewardPageControl.value);
    this.rewardPage[restaurantId] = this.paginationUtils.getSafePage(requestedPage, this.rewardTotal[restaurantId] || 0, this.rewardLimit);
    this.goToRewardPageControl.setValue(this.rewardPage[restaurantId], { emitEvent: false });
    this.loadRestaurantRewards(restaurantId);
  }

  toggleRewardForm(restaurantId: string): void {
    this.showRewardForm[restaurantId] = !this.showRewardForm[restaurantId];
    if (this.showRewardForm[restaurantId]) {
      this.newRewardForm.reset();
      this.newRewardForm.patchValue({ pointsRequired: 0 });
    }
  }

  saveReward(restaurant: IRestaurant): void {
    if (this.newRewardForm.invalid || !restaurant._id) return;

    this.loading = true;
    this.cdr.markForCheck();

    const data: Partial<IReward> = {
      restaurant_id: restaurant._id,
      name: this.newRewardForm.value.name,
      description: this.newRewardForm.value.description,
      pointsRequired: this.newRewardForm.value.pointsRequired,
      active: true,
    };

    this.rewardApi.createReward(data).subscribe({
      next: (savedReward) => {
        if (!restaurant.rewards) restaurant.rewards = [];
        restaurant.rewards.push(savedReward);
        this.showRewardForm[restaurant._id!] = false;

        this.loadRestaurantRewards(restaurant._id!);

        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.errorMsg = 'Could not add reward.';
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  removeReward(restaurant: IRestaurant, reward: any): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: `soft delete ${reward.name || 'this reward'}`,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const rewardId = reward._id || reward.id;
        if (!rewardId) return;

        this.loading = true;
        this.cdr.markForCheck();

        this.rewardApi.softDeleteReward(rewardId).subscribe({
          next: () => {
            this.loadRestaurantRewards(restaurant._id!);

            this.loading = false;
            this.cdr.markForCheck();
          },
          error: () => {
            this.errorMsg = 'Could not remove reward.';
            this.loading = false;
            this.cdr.markForCheck();
          },
        });
      }
    });
  }

  startEditReward(reward: any): void {
    const rewardId = reward._id || reward.id || reward;
    if (!rewardId) return;
    this.editingRewardId = rewardId;
    this.editRewardForm.patchValue({
      name: reward.name || '',
      description: reward.description || '',
      pointsRequired: reward.pointsRequired ?? reward.points ?? 0,
    });
  }

  cancelEditReward(): void {
    this.editingRewardId = null;
    this.editRewardForm.reset();
  }

  saveEditedReward(restaurant: IRestaurant): void {
    if (this.editRewardForm.invalid || !this.editingRewardId) return;

    this.loading = true;
    this.cdr.markForCheck();

    const data: Partial<IReward> = {
      name: this.editRewardForm.value.name,
      description: this.editRewardForm.value.description,
      pointsRequired: this.editRewardForm.value.pointsRequired,
    };

    const targetRewardId = this.editingRewardId;

    this.rewardApi.updateReward(targetRewardId, data).subscribe({
      next: (updatedReward) => {
        this.loadRestaurantRewards(restaurant._id!);

        this.editingRewardId = null;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.errorMsg = 'Could not update reward.';
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  changePage(type: 'restaurants' | 'deleted' | 'rewards' | 'visits', delta: number, id?: string): void {
    if (type === 'restaurants') {
      this.restaurantPager.page = this.paginationUtils.getSafePage(this.restaurantPager.page + delta, this.filteredRestaurants.length, this.restaurantPager.limit);
      this.updatePagedRestaurants();
    }
    else if (type === 'deleted') {
      this.deletedPager.page = this.paginationUtils.getSafePage(this.deletedPager.page + delta, this.filteredDeletedRestaurants.length, this.deletedPager.limit);
      this.updatePagedDeletedRestaurants();
    }
    else if (id) {
      if (type === 'rewards') {
        this.rewardPage[id] = this.paginationUtils.getSafePage((this.rewardPage[id] || 1) + delta, this.rewardTotal[id] || 0, this.rewardLimit);
        this.loadRestaurantRewards(id);
      } else if (type === 'visits') {
        this.visitPage[id] = this.paginationUtils.getSafePage((this.visitPage[id] || 1) + delta, this.visitTotal[id] || 0, this.visitLimit);
        this.loadRestaurantVisits(id);
      }
    }
  }

  // ========================
  // VISITS
  // ========================

  private loadRestaurantVisits(restaurantId: string): void {
    this.visitApi.getVisitsByRestaurantId(restaurantId).subscribe({
      next: (visits: IVisit[]) => {
        this.visitTotal[restaurantId] = visits.length;
        this.visitPage[restaurantId] = this.paginationUtils.getSafePage(
          this.visitPage[restaurantId] || 1,
          visits.length,
          this.visitLimit
        );
        this.restaurantVisits[restaurantId] = this.paginationUtils.getPaginatedData(
          visits,
          this.visitPage[restaurantId],
          this.visitLimit
        );
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.restaurantVisits = { ...this.restaurantVisits, [restaurantId]: [] };
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  goToVisitPage(restaurantId: string): void {
    const requestedPage = Number(this.goToVisitPageControl.value);
    this.visitPage[restaurantId] = this.paginationUtils.getSafePage(requestedPage, this.visitTotal[restaurantId] || 0, this.visitLimit);
    this.goToVisitPageControl.setValue(this.visitPage[restaurantId], { emitEvent: false });
    this.loadRestaurantVisits(restaurantId);
  }

  toggleVisitForm(restaurantId: string): void {
    this.showVisitForm[restaurantId] = !this.showVisitForm[restaurantId];
    if (this.showVisitForm[restaurantId]) {
      this.newVisitForm.reset();
      this.newVisitForm.patchValue({
        date: new Date().toISOString().substring(0, 16),
        billAmount: 0,
        pointsEarned: 0,
      });

      this.errorMsg = '';
      this.loadingCustomers = true;
      this.customerApi.getCustomers().subscribe({
        next: (res: ICustomer[]) => {
          const data = res ?? [];
          this.customers = data;
          this.loadingCustomers = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.errorMsg = 'Could not load customers.';
          this.loadingCustomers = false;
          this.cdr.markForCheck();
        },
      });
    }
  }

  saveVisit(restaurantId: string): void {
    if (this.newVisitForm.invalid) return;

    this.loading = true;
    this.cdr.markForCheck();

    const data: Partial<IVisit> = {
      restaurant_id: restaurantId as any,
      customer_id: this.newVisitForm.value.customer_id,
      date: new Date(this.newVisitForm.value.date),
      billAmount: this.newVisitForm.value.billAmount,
      pointsEarned: this.newVisitForm.value.pointsEarned,
    };

    this.visitApi.createVisit(data).subscribe({
      next: () => {
        this.showVisitForm[restaurantId] = false;
        this.loadRestaurantVisits(restaurantId);
      },
      error: () => {
        this.errorMsg = 'Could not add visit.';
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  removeVisit(restaurantId: string, visit: IVisit): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: `soft delete visit from ${visit.customer_id?.name || 'this customer'}`,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const visitId = visit._id || visit.id;
        if (!visitId) return;

        this.loading = true;
        this.cdr.markForCheck();

        this.visitApi.softDeleteVisit(visitId).subscribe({
          next: () => {
            this.loadRestaurantVisits(restaurantId);
            this.loading = false;
            this.cdr.markForCheck();
          },
          error: () => {
            this.errorMsg = 'Could not remove visit.';
            this.loading = false;
            this.cdr.markForCheck();
          },
        });
      }
    });
  }

  startEditVisit(visit: any): void {
    const visitId = visit._id || visit.id;
    if (!visitId) return;
    this.editingVisitId = visitId;

    let dateStr = '';
    if (visit.date) {
      const d = new Date(visit.date);
      if (!isNaN(d.getTime())) {
        dateStr = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
          .toISOString()
          .substring(0, 16);
      }
    }

    this.editVisitForm.patchValue({
      date: dateStr,
      billAmount: visit.billAmount || 0,
      pointsEarned: visit.pointsEarned || 0,
    });
  }

  cancelEditVisit(): void {
    this.editingVisitId = null;
    this.editVisitForm.reset();
  }

  saveEditedVisit(restaurantId: string): void {
    if (this.editVisitForm.invalid || !this.editingVisitId) return;

    this.loading = true;
    this.cdr.markForCheck();

    const data: Partial<IVisit> = {
      date: new Date(this.editVisitForm.value.date),
      billAmount: this.editVisitForm.value.billAmount,
      pointsEarned: this.editVisitForm.value.pointsEarned,
    };

    const targetVisitId = this.editingVisitId;

    this.visitApi.updateVisit(targetVisitId, data).subscribe({
      next: () => {
        this.editingVisitId = null;
        this.loadRestaurantVisits(restaurantId);
      },
      error: () => {
        this.errorMsg = 'Could not update visit.';
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  // ========================
  // DISHES
  // ========================

  private buildAvailableAt(formValue: any): string[] {
    const map: { [key: string]: string } = {
      availableAtBreakfast: 'breakfast',
      availableAtBrunch: 'brunch',
      availableAtLunch: 'lunch',
      availableAtHappyHour: 'happy-hour',
      availableAtDinner: 'dinner',
      availableAtAllDay: 'all-day',
    };
    return Object.keys(map)
      .filter((k) => formValue[k])
      .map((k) => map[k]);
  }

  private patchDishFormAvailableAt(form: FormGroup, availableAt: string[] = []): void {
    form.patchValue({
      availableAtBreakfast: availableAt.includes('breakfast'),
      availableAtBrunch: availableAt.includes('brunch'),
      availableAtLunch: availableAt.includes('lunch'),
      availableAtHappyHour: availableAt.includes('happy-hour'),
      availableAtDinner: availableAt.includes('dinner'),
      availableAtAllDay: availableAt.includes('all-day'),
    });
  }

  private loadRestaurantDishes(restaurantId: string): void {
    this.dishApi.getDishes().subscribe({
      next: (allDishes: IDish[]) => {
        const filtered = allDishes.filter((d) => d.restaurant_id === restaurantId);
        this.dishTotal[restaurantId] = filtered.length;
        this.dishPage[restaurantId] = this.paginationUtils.getSafePage(
          this.dishPage[restaurantId] || 1,
          filtered.length,
          this.dishLimit
        );
        this.restaurantDishes[restaurantId] = this.paginationUtils.getPaginatedData(
          filtered,
          this.dishPage[restaurantId],
          this.dishLimit
        );
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.restaurantDishes[restaurantId] = [];
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  nextDishPage(restaurantId: string): void {
    this.dishPage[restaurantId] = this.paginationUtils.getSafePage((this.dishPage[restaurantId] || 1) + 1, this.dishTotal[restaurantId] || 0, this.dishLimit);
    this.loadRestaurantDishes(restaurantId);
  }

  prevDishPage(restaurantId: string): void {
    this.dishPage[restaurantId] = this.paginationUtils.getSafePage((this.dishPage[restaurantId] || 1) - 1, this.dishTotal[restaurantId] || 0, this.dishLimit);
    this.loadRestaurantDishes(restaurantId);
  }

  goToDishPage(restaurantId: string): void {
    const requestedPage = Number(this.goToDishPageControl.value);
    this.dishPage[restaurantId] = this.paginationUtils.getSafePage(requestedPage, this.dishTotal[restaurantId] || 0, this.dishLimit);
    this.goToDishPageControl.setValue(this.dishPage[restaurantId], { emitEvent: false });
    this.loadRestaurantDishes(restaurantId);
  }

  toggleDishForm(restaurantId: string): void {
    this.showDishForm[restaurantId] = !this.showDishForm[restaurantId];
    if (this.showDishForm[restaurantId]) {
      this.newDishForm.reset();
      this.newDishForm.patchValue({ active: true, price: 0 });
    }
  }

  saveDish(restaurantId: string): void {
    if (this.newDishForm.invalid) return;
    const v = this.newDishForm.value;
    const availableAt = this.buildAvailableAt(v);
    if (availableAt.length === 0) {
      this.errorMsg = 'Select at least one availability period.';
      return;
    }
    this.loading = true;
    this.cdr.markForCheck();
    const data: Partial<IDish> = {
      restaurant_id: restaurantId as any,
      name: v.name,
      description: v.description || undefined,
      section: v.section,
      price: v.price,
      active: v.active,
      availableAt,
      portionSize: v.portionSize || undefined,
    };
    this.dishApi.createDish(data).subscribe({
      next: () => {
        this.showDishForm[restaurantId] = false;
        this.loadRestaurantDishes(restaurantId);
      },
      error: () => {
        this.errorMsg = 'Could not add dish.';
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  removeDish(restaurantId: string, dish: any): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: `soft delete "${dish.name || 'this dish'}"`,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const dishId = dish._id || dish.id;
        if (!dishId) return;
        this.loading = true;
        this.cdr.markForCheck();
        this.dishApi.softDeleteDish(dishId).subscribe({
          next: () => {
            this.loadRestaurantDishes(restaurantId);
          },
          error: () => {
            this.errorMsg = 'Could not remove dish.';
            this.loading = false;
            this.cdr.markForCheck();
          },
        });
      }
    });
  }

  startEditDish(dish: any): void {
    const dishId = dish._id || dish.id;
    if (!dishId) return;
    this.editingDishId = dishId;
    this.editDishForm.patchValue({
      name: dish.name || '',
      description: dish.description || '',
      section: dish.section || '',
      price: dish.price ?? 0,
      active: dish.active ?? true,
      portionSize: dish.portionSize || '',
    });
    this.patchDishFormAvailableAt(this.editDishForm, dish.availableAt || []);
  }

  cancelEditDish(): void {
    this.editingDishId = null;
    this.editDishForm.reset();
  }

  saveEditedDish(restaurantId: string): void {
    if (this.editDishForm.invalid || !this.editingDishId) return;
    const v = this.editDishForm.value;
    const availableAt = this.buildAvailableAt(v);
    if (availableAt.length === 0) {
      this.errorMsg = 'Select at least one availability period.';
      return;
    }
    this.loading = true;
    this.cdr.markForCheck();
    const data: Partial<IDish> = {
      name: v.name,
      description: v.description || undefined,
      section: v.section,
      price: v.price,
      active: v.active,
      availableAt,
      portionSize: v.portionSize || undefined,
    };
    const targetDishId = this.editingDishId;
    this.dishApi.updateDish(targetDishId, data).subscribe({
      next: () => {
        this.editingDishId = null;
        this.loadRestaurantDishes(restaurantId);
      },
      error: () => {
        this.errorMsg = 'Could not update dish.';
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  // ========================
  // EMPLOYEES
  // ========================

  private loadRestaurantEmployees(restaurantId: string): void {
    this.employeeApi.getEmployees().subscribe({
      next: (allEmployees: IEmployee[]) => {
        const filtered = allEmployees.filter((e) => e.restaurant_id === restaurantId);
        this.employeeTotal[restaurantId] = filtered.length;
        this.employeePage[restaurantId] = this.paginationUtils.getSafePage(
          this.employeePage[restaurantId] || 1,
          filtered.length,
          this.employeeLimit
        );
        this.restaurantEmployees[restaurantId] = this.paginationUtils.getPaginatedData(
          filtered,
          this.employeePage[restaurantId],
          this.employeeLimit
        );
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.restaurantEmployees[restaurantId] = [];
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  nextEmployeePage(restaurantId: string): void {
    this.employeePage[restaurantId] = this.paginationUtils.getSafePage((this.employeePage[restaurantId] || 1) + 1, this.employeeTotal[restaurantId] || 0, this.employeeLimit);
    this.loadRestaurantEmployees(restaurantId);
  }

  prevEmployeePage(restaurantId: string): void {
    this.employeePage[restaurantId] = this.paginationUtils.getSafePage((this.employeePage[restaurantId] || 1) - 1, this.employeeTotal[restaurantId] || 0, this.employeeLimit);
    this.loadRestaurantEmployees(restaurantId);
  }

  goToEmployeePage(restaurantId: string): void {
    const requestedPage = Number(this.goToEmployeePageControl.value);
    this.employeePage[restaurantId] = this.paginationUtils.getSafePage(requestedPage, this.employeeTotal[restaurantId] || 0, this.employeeLimit);
    this.goToEmployeePageControl.setValue(this.employeePage[restaurantId], { emitEvent: false });
    this.loadRestaurantEmployees(restaurantId);
  }

  toggleEmployeeForm(restaurantId: string): void {
    this.showEmployeeForm[restaurantId] = !this.showEmployeeForm[restaurantId];
    if (this.showEmployeeForm[restaurantId]) {
      this.newEmployeeForm.reset();
      this.newEmployeeForm.patchValue({ role: 'staff', isActive: true });
    }
  }

  saveEmployee(restaurantId: string): void {
    if (this.newEmployeeForm.invalid) return;
    const v = this.newEmployeeForm.value;
    this.loading = true;
    this.cdr.markForCheck();
    const data: Partial<IEmployee> = {
      restaurant_id: restaurantId,
      profile: {
        name: v.name,
        email: v.email || undefined,
        phone: v.phone || undefined,
        role: v.role || 'staff',
        password: v.password || undefined,
      },
      isActive: v.isActive,
    };
    this.employeeApi.createEmployee(data).subscribe({
      next: () => {
        this.showEmployeeForm[restaurantId] = false;
        this.loadRestaurantEmployees(restaurantId);
      },
      error: () => {
        this.errorMsg = 'Could not add employee.';
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  removeEmployee(restaurantId: string, employee: any): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: `soft delete "${employee.profile?.name || 'this employee'}"`,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const employeeId = employee._id;
        if (!employeeId) return;
        this.loading = true;
        this.cdr.markForCheck();
        this.employeeApi.softDeleteEmployee(employeeId).subscribe({
          next: () => {
            this.loadRestaurantEmployees(restaurantId);
          },
          error: () => {
            this.errorMsg = 'Could not remove employee.';
            this.loading = false;
            this.cdr.markForCheck();
          },
        });
      }
    });
  }

  startEditEmployee(employee: any): void {
    if (!employee._id) return;
    this.editingEmployeeId = employee._id;
    this.editEmployeeForm.patchValue({
      name: employee.profile?.name || '',
      email: employee.profile?.email || '',
      phone: employee.profile?.phone || '',
      role: employee.profile?.role || 'staff',
      isActive: employee.isActive ?? true,
    });
  }

  cancelEditEmployee(): void {
    this.editingEmployeeId = null;
    this.editEmployeeForm.reset();
  }

  saveEditedEmployee(restaurantId: string): void {
    if (this.editEmployeeForm.invalid || !this.editingEmployeeId) return;

    this.loading = true;
    this.cdr.markForCheck();

    const v = this.editEmployeeForm.value;
    const data: Partial<IEmployee> = {
      profile: {
        name: v.name,
        email: v.email || undefined,
        phone: v.phone || undefined,
        role: v.role || 'staff',
      },
      isActive: v.isActive,
    };

    this.employeeApi.updateEmployee(this.editingEmployeeId, data).subscribe({
      next: () => {
        this.editingEmployeeId = null;
        this.loadRestaurantEmployees(restaurantId);
      },
      error: () => {
        this.errorMsg = 'Could not update employee.';
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  // ========================
  // BADGES
  // ========================

  private loadRestaurantBadges(restaurantId: string): void {
    this.badgeApi.getBadgesByRestaurant(restaurantId).subscribe({
      next: (badges: IBadge[]) => {
        this.badgeTotal[restaurantId] = badges.length;
        this.badgePage[restaurantId] = this.paginationUtils.getSafePage(
          this.badgePage[restaurantId] || 1,
          badges.length,
          this.badgeLimit
        );
        this.restaurantBadges[restaurantId] = this.paginationUtils.getPaginatedData(
          badges,
          this.badgePage[restaurantId],
          this.badgeLimit
        );
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.restaurantBadges[restaurantId] = [];
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  nextBadgePage(restaurantId: string): void {
    this.badgePage[restaurantId] = this.paginationUtils.getSafePage((this.badgePage[restaurantId] || 1) + 1, this.badgeTotal[restaurantId] || 0, this.badgeLimit);
    this.loadRestaurantBadges(restaurantId);
  }

  prevBadgePage(restaurantId: string): void {
    this.badgePage[restaurantId] = this.paginationUtils.getSafePage((this.badgePage[restaurantId] || 1) - 1, this.badgeTotal[restaurantId] || 0, this.badgeLimit);
    this.loadRestaurantBadges(restaurantId);
  }

  goToBadgePage(restaurantId: string): void {
    const requestedPage = Number(this.goToBadgePageControl.value);
    this.badgePage[restaurantId] = this.paginationUtils.getSafePage(requestedPage, this.badgeTotal[restaurantId] || 0, this.badgeLimit);
    this.goToBadgePageControl.setValue(this.badgePage[restaurantId], { emitEvent: false });
    this.loadRestaurantBadges(restaurantId);
  }

  toggleBadgeForm(restaurantId: string): void {
    this.showBadgeForm[restaurantId] = !this.showBadgeForm[restaurantId];
    if (this.showBadgeForm[restaurantId]) {
      this.newBadgeForm.reset();
      this.newBadgeForm.patchValue({ type: 'achievement' });
    }
  }

  saveBadge(restaurantId: string): void {
    if (this.newBadgeForm.invalid) return;
    this.loading = true;
    this.cdr.markForCheck();

    // Step 1: Create the global badge (no restaurant_id)
    const badgeData: Partial<IBadge> = { ...this.newBadgeForm.value };

    this.badgeApi.createBadge(badgeData).subscribe({
      next: (createdBadge: IBadge) => {
        const badgeId = createdBadge._id;
        if (!badgeId) {
          this.loading = false;
          this.cdr.markForCheck();
          return;
        }

        // Step 2: Get current restaurant badge IDs and add the new one
        const full = this.restaurantFull[restaurantId];
        const currentIds: string[] = (full?.badges ?? []).map((b: any) =>
          typeof b === 'string' ? b : (b._id ?? b),
        );
        currentIds.push(badgeId);

        this.api.updateRestaurant(restaurantId, { badges: currentIds as any }).subscribe({
          next: () => {
            this.showBadgeForm[restaurantId] = false;
            this.loading = false;
            this.refreshRestaurantFull(restaurantId);
            this.loadRestaurantBadges(restaurantId);
          },
          error: (err) => {
            console.error('Error linking badge to restaurant:', err);
            this.errorMsg = 'Badge created but could not link to restaurant.';
            this.loading = false;
            this.cdr.markForCheck();
          },
        });
      },
      error: (err) => {
        console.error('Error adding badge:', err);
        this.errorMsg = 'Could not add badge.';
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  removeBadge(restaurantId: string, badge: any): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: `soft delete badge "${badge.title || 'this badge'}"`,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const badgeId = badge._id;
        if (!badgeId) return;
        this.loading = true;
        this.cdr.markForCheck();

        // Remove from restaurant's badge array first
        const full = this.restaurantFull[restaurantId];
        const updatedIds: string[] = (full?.badges ?? [])
          .map((b: any) => (typeof b === 'string' ? b : (b._id ?? b)))
          .filter((id: string) => id !== badgeId);

        this.api.updateRestaurant(restaurantId, { badges: updatedIds as any }).subscribe({
          next: () => {
            // Then delete the global badge
            this.badgeApi.softDeleteBadge(badgeId).subscribe({
              next: () => {
                this.loading = false;
                this.refreshRestaurantFull(restaurantId);
                this.loadRestaurantBadges(restaurantId);
              },
              error: () => {
                this.loading = false;
                this.loadRestaurantBadges(restaurantId);
              },
            });
          },
          error: () => {
            this.errorMsg = 'Could not unlink badge from restaurant.';
            this.loading = false;
            this.cdr.markForCheck();
          },
        });
      }
    });
  }

  startEditBadge(badge: any): void {
    if (!badge._id) return;
    this.editingBadgeId = badge._id;
    this.editBadgeForm.patchValue({
      title: badge.title || '',
      description: badge.description || '',
      type: badge.type || 'achievement',
    });
  }

  cancelEditBadge(): void {
    this.editingBadgeId = null;
    this.editBadgeForm.reset();
  }

  saveEditedBadge(restaurantId: string): void {
    if (this.editBadgeForm.invalid || !this.editingBadgeId) return;
    this.loading = true;
    this.cdr.markForCheck();
    const targetId = this.editingBadgeId;
    this.badgeApi.updateBadge(targetId, this.editBadgeForm.value).subscribe({
      next: () => {
        this.editingBadgeId = null;
        this.loadRestaurantBadges(restaurantId);
      },
      error: () => {
        this.errorMsg = 'Could not update badge.';
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  // ========================
  // PAGINATION
  // ========================

  leftPage(): void {
    this.restaurantPager.page = this.paginationUtils.getSafePage(this.restaurantPager.page - 1, this.filteredRestaurants.length, this.restaurantPager.limit);
    this.updatePagedRestaurants();
  }

  rightPage(): void {
    this.restaurantPager.page = this.paginationUtils.getSafePage(this.restaurantPager.page + 1, this.filteredRestaurants.length, this.restaurantPager.limit);
    this.updatePagedRestaurants();
  }

  goToPage(): void {
    const requestedPage = Number(this.goToPageControl.value);
    this.restaurantPager.page = this.paginationUtils.getSafePage(requestedPage, this.filteredRestaurants.length, this.restaurantPager.limit);
    this.goToPageControl.setValue(this.restaurantPager.page, { emitEvent: false });
    this.updatePagedRestaurants();
  }

  getTotalPages(): number {
    return this.paginationUtils.getTotalPages(this.filteredRestaurants.length, this.restaurantPager.limit);
  }

  private updatePagedRestaurants(): void {
    this.restaurantPager.page = this.paginationUtils.getSafePage(this.restaurantPager.page, this.filteredRestaurants.length, this.restaurantPager.limit);
    this.pagedRestaurants = this.paginationUtils.getPaginatedData(
      this.filteredRestaurants,
      this.restaurantPager.page,
      this.restaurantPager.limit
    );
    this.goToPageControl.setValue(this.restaurantPager.page, { emitEvent: false });
    this.cdr.markForCheck();
  }

  getTotalDeletedPages(): number {
    return this.paginationUtils.getTotalPages(this.filteredDeletedRestaurants.length, this.deletedPager.limit);
  }

  private updatePagedDeletedRestaurants(): void {
    this.deletedPager.page = this.paginationUtils.getSafePage(this.deletedPager.page, this.filteredDeletedRestaurants.length, this.deletedPager.limit);
    this.pagedDeletedRestaurants = this.paginationUtils.getPaginatedData(
      this.filteredDeletedRestaurants,
      this.deletedPager.page,
      this.deletedPager.limit
    );
    this.goToDeletedPageControl.setValue(this.deletedPager.page, { emitEvent: false });
    this.cdr.markForCheck();
  }

  leftDeletedPage(): void {
    this.deletedPager.page = this.paginationUtils.getSafePage(this.deletedPager.page - 1, this.filteredDeletedRestaurants.length, this.deletedPager.limit);
    this.updatePagedDeletedRestaurants();
  }

  rightDeletedPage(): void {
    this.deletedPager.page = this.paginationUtils.getSafePage(this.deletedPager.page + 1, this.filteredDeletedRestaurants.length, this.deletedPager.limit);
    this.updatePagedDeletedRestaurants();
  }

  goToDeletedPage(): void {
    const requestedPage = Number(this.goToDeletedPageControl.value);
    this.deletedPager.page = this.paginationUtils.getSafePage(requestedPage, this.filteredDeletedRestaurants.length, this.deletedPager.limit);
    this.goToDeletedPageControl.setValue(this.deletedPager.page, { emitEvent: false });
    this.updatePagedDeletedRestaurants();
  }
}
