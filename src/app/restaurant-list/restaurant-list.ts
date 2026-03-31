import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RestaurantService } from '../services/restaurant.service';
import { RewardService } from '../services/reward.service';
import { VisitService } from '../services/visit.service';
import { IRestaurant } from '../models/restaurant.model';
import { IReward } from '../models/reward.model';
import { IVisit } from '../models/visit.model';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog';
import { ICustomer } from '../models/customer.model';
import { CustomerService } from '../services/customer.service';

@Component({
  selector: 'app-restaurant-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule],
  templateUrl: './restaurant-list.html',
  styleUrls: ['./restaurant-list.css'],
})
export class RestaurantList implements OnInit {
  Math = Math;
  
  restaurants: IRestaurant[] = [];
  customers: ICustomer[] = [];
  filteredRestaurants: IRestaurant[] = [];
  pagedRestaurants: IRestaurant[] = [];
  searchControl = new FormControl('');
  search: boolean = false;
  loading: boolean = true;
  errorMsg: string = '';
  showForm = false;
  restaurantForm!: FormGroup;
  editting = false;
  restaurantEditId: string | undefined;
  expanded: { [key: string]: boolean } = {};
  restaurantFull: { [key: string]: IRestaurant } = {};
  limit = 3;
  currentPage = 1;
  showAllRestaurants = false;
  showAllData = false;
  goToPageControl = new FormControl<number | null>(1);

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

  constructor(
    private api: RestaurantService,
    private rewardApi: RewardService,
    private visitApi: VisitService,
    private customerApi: CustomerService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog
  ) {
    this.restaurantForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(120)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(2000)]],
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
      globalRating: [0, [Validators.pattern('^[0-5]+(\\.[0-9]+)?$'), Validators.min(0), Validators.max(5)]],
      monday:    ['', [Validators.pattern('(?:[01]\\d|2[0-3]):[0-5]\\d-(?:[01]\\d|2[0-3]):[0-5]\\d(?:,(?:[01]\\d|2[0-3]):[0-5]\\d-(?:[01]\\d|2[0-3]):[0-5]\\d)*')]],
      tuesday:   ['', [Validators.pattern('(?:[01]\\d|2[0-3]):[0-5]\\d-(?:[01]\\d|2[0-3]):[0-5]\\d(?:,(?:[01]\\d|2[0-3]):[0-5]\\d-(?:[01]\\d|2[0-3]):[0-5]\\d)*')]],
      wednesday: ['', [Validators.pattern('(?:[01]\\d|2[0-3]):[0-5]\\d-(?:[01]\\d|2[0-3]):[0-5]\\d(?:,(?:[01]\\d|2[0-3]):[0-5]\\d-(?:[01]\\d|2[0-3]):[0-5]\\d)*')]],
      thursday:  ['', [Validators.pattern('(?:[01]\\d|2[0-3]):[0-5]\\d-(?:[01]\\d|2[0-3]):[0-5]\\d(?:,(?:[01]\\d|2[0-3]):[0-5]\\d-(?:[01]\\d|2[0-3]):[0-5]\\d)*')]],
      friday:    ['', [Validators.pattern('(?:[01]\\d|2[0-3]):[0-5]\\d-(?:[01]\\d|2[0-3]):[0-5]\\d(?:,(?:[01]\\d|2[0-3]):[0-5]\\d-(?:[01]\\d|2[0-3]):[0-5]\\d)*')]],
      saturday:  ['', [Validators.pattern('(?:[01]\\d|2[0-3]):[0-5]\\d-(?:[01]\\d|2[0-3]):[0-5]\\d(?:,(?:[01]\\d|2[0-3]):[0-5]\\d-(?:[01]\\d|2[0-3]):[0-5]\\d)*')]],
      sunday:    ['', [Validators.pattern('(?:[01]\\d|2[0-3]):[0-5]\\d-(?:[01]\\d|2[0-3]):[0-5]\\d(?:,(?:[01]\\d|2[0-3]):[0-5]\\d-(?:[01]\\d|2[0-3]):[0-5]\\d)*')]],
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
      pointsRequired: [0, [Validators.min(0)]]
    });

    this.editRewardForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      pointsRequired: [0, [Validators.min(0)]]
    });

    this.newVisitForm = this.fb.group({
      customer_id: ['', Validators.required],
      date: [new Date().toISOString().substring(0, 16), Validators.required],
      billAmount: [0, [Validators.min(0)]],
      pointsEarned: [0, [Validators.min(0)]]
    });

    this.editVisitForm = this.fb.group({
      date: ['', Validators.required],
      billAmount: [0, [Validators.min(0)]],
      pointsEarned: [0, [Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    this.load();

    this.searchControl.valueChanges.subscribe(value => {
      const term = value?.toLowerCase() ?? '';
      term ? this.search = true : this.search = false;
      this.filteredRestaurants = this.restaurants.filter(restaurant =>
        restaurant.profile.name.toLowerCase().includes(term)
      );
      this.currentPage = 1;
      this.updatePagedRestaurants();
    });
  }

  load(): void {
    this.loading = true;
    this.errorMsg = '';
    this.cdr.markForCheck();

    this.api.getRestaurants().subscribe({
      next: (res: any) => {
        const data = res?.data ?? res ?? [];
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

  private refreshRestaurantFull(restaurantId: string) {
    this.api.getRestaurantFull(restaurantId).subscribe({
      next: (full) => {
        this.restaurantFull[restaurantId] = full;
        this.visitPage[restaurantId] = 0;
        this.cdr.markForCheck();
      },
      error: () => {
        this.errorMsg = 'Could not load full restaurant data.';
        this.cdr.markForCheck();
      }
    });
  }

  toggleExpand(restaurantId: string): void {
    this.expanded[restaurantId] = !this.expanded[restaurantId];

    if (this.expanded[restaurantId]) {
      this.refreshRestaurantFull(restaurantId);
      this.loadRestaurantRewards(restaurantId);
      this.loadRestaurantVisits(restaurantId);

        if (!this.restaurantVisits[restaurantId]) {
          this.loadRestaurantVisits(restaurantId);
        }
    }
  }

  edit(restaurant: IRestaurant): void {
    this.showForm = true;
    this.editting = true;
    this.restaurantEditId = restaurant._id;

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
      categoryPub: restaurant.profile.category?.includes('Pub'),
      categoryWineBar: restaurant.profile.category?.includes('Wine Bar'),
      categoryRooftop: restaurant.profile.category?.includes('Rooftop'),
      categoryBar: restaurant.profile.category?.includes('Bar'),
      categoryTaperia: restaurant.profile.category?.includes('Taperia'),
      categoryGelateria: restaurant.profile.category?.includes('Gelateria'),
      categoryEstrellaMichelin: restaurant.profile.category?.includes('Estrella Michelin'),
      categoryStreetFood: restaurant.profile.category?.includes('Street Food'),
      monday:    restaurant.profile.timetable?.monday    ? restaurant.profile.timetable.monday.map(s => `${s.open}-${s.close}`).join(',') : '',
      tuesday:   restaurant.profile.timetable?.tuesday   ? restaurant.profile.timetable.tuesday.map(s => `${s.open}-${s.close}`).join(',') : '',
      wednesday: restaurant.profile.timetable?.wednesday ? restaurant.profile.timetable.wednesday.map(s => `${s.open}-${s.close}`).join(',') : '',
      thursday:  restaurant.profile.timetable?.thursday  ? restaurant.profile.timetable.thursday.map(s => `${s.open}-${s.close}`).join(',') : '',
      friday:    restaurant.profile.timetable?.friday    ? restaurant.profile.timetable.friday.map(s => `${s.open}-${s.close}`).join(',') : '',
      saturday:  restaurant.profile.timetable?.saturday  ? restaurant.profile.timetable.saturday.map(s => `${s.open}-${s.close}`).join(',') : '',
      sunday:    restaurant.profile.timetable?.sunday    ? restaurant.profile.timetable.sunday.map(s => `${s.open}-${s.close}`).join(',') : '',
      imageUrl:      restaurant.profile.image ? restaurant.profile.image : '',
      phone:         restaurant.profile.contact?.phone || '',
      email:         restaurant.profile.contact?.email || '',
      city:          restaurant.profile.location?.city || '',
      address:       restaurant.profile.location?.address || '',
      googlePlaceId: restaurant.profile.location?.googlePlaceId || '',
      type: restaurant.profile.location?.coordinates?.type || '',
      lat:  restaurant.profile.location?.coordinates?.coordinates[1] || '',
      lon:  restaurant.profile.location?.coordinates?.coordinates[0] || '',
      employees:  restaurant.employees ? restaurant.employees.join(', ') : '',
      dishes:     restaurant.dishes    ? restaurant.dishes.join(', ')    : '',
      statistics: restaurant.statistics || '',
      badges:     restaurant.badges    ? restaurant.badges.join(', ')    : '',
    });
  }

  save(): void {
    if (this.restaurantForm.invalid) return;

    this.loading = true;
    this.errorMsg = '';
    this.cdr.markForCheck();

    const parseDay = (val: string): { open: string; close: string }[] | undefined =>
      val ? val.split(',').map((slot: string) => {
        const [open, close] = slot.split('-');
        return { open, close };
      }) : undefined;

    const category: string[] = [];
    const cats: { [key: string]: string } = {
      categoryItalià: 'Italià', categoryJaponès: 'Japonès', categorySushi: 'Sushi',
      categoryMexicà: 'Mexicà', categoryXinès: 'Xinès', categoryIndi: 'Indi',
      categoryTailandès: 'Tailandès', categoryFrancès: 'Francès', categoryEspanyol: 'Espanyol',
      categoryGrec: 'Grec', categoryTurc: 'Turc', categoryCoreà: 'Coreà',
      categoryVietnamita: 'Vietnamita', categoryAlemany: 'Alemany', categoryBrasileny: 'Brasileny',
      categoryPeruà: 'Peruà', categoryVegà: 'Vegà', categoryVegetarià: 'Vegetarià',
      categoryMarisc: 'Marisc', categoryCarn: 'Carn', categoryPizzeria: 'Pizzeria',
      categoryCafeteria: 'Cafeteria', categoryRamen: 'Ramen', categoryGlutenFree: 'Gluten Free',
      categoryGourmet: 'Gourmet', categoryFastFood: 'Fast Food', categoryBuffet: 'Buffet',
      categoryFoodTruck: 'Food Truck', categoryLounge: 'Lounge', categoryPub: 'Pub',
      categoryWineBar: 'Wine Bar', categoryRooftop: 'Rooftop', categoryBar: 'Bar',
      categoryTaperia: 'Taperia', categoryGelateria: 'Gelateria',
      categoryEstrellaMichelin: 'Estrella Michelin', categoryStreetFood: 'Street Food',
    };
    Object.keys(cats).forEach(key => {
      if (this.restaurantForm.value[key]) category.push(cats[key]);
    });

    if (category.length === 0) return;

    const v = this.restaurantForm.value;
    const newRestaurant: Partial<IRestaurant> = {
      profile: {
        timetable: {
          monday:    parseDay(v.monday),
          tuesday:   parseDay(v.tuesday),
          wednesday: parseDay(v.wednesday),
          thursday:  parseDay(v.thursday),
          friday:    parseDay(v.friday),
          saturday:  parseDay(v.saturday),
          sunday:    parseDay(v.sunday),
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
          city:          v.city || undefined,
          address:       v.address || undefined,
          googlePlaceId: v.googlePlaceId || undefined,
        },
        name:        v.name,
        description: v.description,
        globalRating: v.globalRating,
        category,
        image: v.imageUrl ? v.imageUrl.split(',') : undefined,
      },
      employees:  undefined,
      dishes:     undefined,
      rewards:    undefined,
      statistics: v.statistics || undefined,
      badges:     undefined,
    };

    if (this.editting && this.restaurantEditId) {
      this.api.updateRestaurant(this.restaurantEditId, newRestaurant).subscribe({
        next: () => { this.resetForm(); this.load(); },
        error: (err) => {
          this.errorMsg = 'Could not update the restaurant.';
          console.error(err);
          this.loading = false;
          this.cdr.markForCheck();
        }
      });
    } else {
      this.api.createRestaurant(newRestaurant).subscribe({
        next: () => { this.resetForm(); this.load(); },
        error: (err) => {
          this.errorMsg = 'Could not create the restaurant.';
          console.error(err);
          this.loading = false;
          this.cdr.markForCheck();
        }
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
    const dialogRef = this.dialog.open(ConfirmDialogComponent, { data: name });
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.delete(id);
    });
  }

  delete(id: string): void {
    this.errorMsg = '';
    this.loading = true;
    this.cdr.markForCheck();

    this.api.deleteRestaurant(id).subscribe({
      next: () => this.load(),
      error: () => {
        this.errorMsg = 'Error delete';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  // ========================
  // REWARDS
  // ========================

  private loadRestaurantRewards(restaurantId: string): void {
    this.rewardApi.getRewards().subscribe({
      next: (allRewards: IReward[]) => {
        console.log(allRewards);
        console.log(restaurantId);
        const res: IReward[] = allRewards.filter((reward: IReward) => reward.restaurant_id === restaurantId)
        console.log(res);
        this.restaurantRewards = {
          ...this.restaurantRewards,
          [restaurantId]: this.paginateRewards(res, restaurantId) ?? []
        };
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.restaurantRewards = { ...this.restaurantRewards, [restaurantId]: [] };
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  private paginateRewards(rewards: IReward[], restaurantId: string): IReward[] {
    const page = this.rewardPage[restaurantId] || 0;
    const start = page * this.rewardLimit;
    const end = start + this.rewardLimit;

    this.rewardTotal[restaurantId] = rewards.length;

    return rewards.slice(start, end);
  }

  nextRewardPage(restaurantId: string): void {
    const page = this.rewardPage[restaurantId] || 0;
    const total = this.rewardTotal[restaurantId] || 0;

    if ((page + 1) * this.rewardLimit >= total) return;

    this.rewardPage[restaurantId] = page + 1;
    this.loadRestaurantRewards(restaurantId);
  }

  prevRewardPage(restaurantId: string): void {
    if ((this.rewardPage[restaurantId] || 0) === 0) return;

    this.rewardPage[restaurantId]--;
    this.loadRestaurantRewards(restaurantId);
  }

  goToRewardPage(restaurantId: string): void {
    const requestedPage = Number(this.goToRewardPageControl.value);
    if (!Number.isFinite(requestedPage)) return;

    const totalPages = this.rewardTotal[restaurantId] || 0;
    const safePage = Math.min(Math.max(1, Math.trunc(requestedPage)), totalPages);

    this.rewardPage[restaurantId] = safePage - 1;
    this.goToRewardPageControl.setValue(safePage, { emitEvent: false });
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
      active: true
    };

    this.rewardApi.createReward(data).subscribe({
      next: (savedReward) => {
        if (!restaurant.rewards) restaurant.rewards = [];
        restaurant.rewards.push(savedReward);
        this.showRewardForm[restaurant._id!] = false;

        this.refreshRestaurantFull(restaurant._id!);

        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.errorMsg = 'Could not add reward.';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  removeReward(restaurant: IRestaurant, reward: any): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: `Delete ${reward.name || 'this reward'}?`
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const rewardId = reward._id || reward.id;
        if (!rewardId) return;

        this.loading = true;
        this.cdr.markForCheck();

        this.rewardApi.deleteReward(rewardId).subscribe({
          next: () => {
            this.refreshRestaurantFull(restaurant._id!);
            
            this.loading = false;
            this.cdr.markForCheck();
          },
          error: () => {
            this.errorMsg = 'Could not remove reward.';
            this.loading = false;
            this.cdr.markForCheck();
          }
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
      pointsRequired: reward.pointsRequired ?? reward.points ?? 0
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
      pointsRequired: this.editRewardForm.value.pointsRequired
    };

    const targetRewardId = this.editingRewardId;

    this.rewardApi.updateReward(targetRewardId, data).subscribe({
      next: (updatedReward) => {
        this.refreshRestaurantFull(restaurant._id!);

        this.editingRewardId = null;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.errorMsg = 'Could not update reward.';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  // ========================
  // VISITS
  // ========================

  private loadRestaurantVisits(restaurantId: string): void {
    this.visitApi.getVisitsByRestaurantId(restaurantId).subscribe({
      next: (res: any) => {
        this.restaurantVisits = {
          ...this.restaurantVisits,
          [restaurantId]: this.paginateVisits(res.data, restaurantId) ?? []
        };
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.restaurantVisits = { ...this.restaurantVisits, [restaurantId]: [] };
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  private paginateVisits(visits: IVisit[], restaurantId: string): IVisit[] {
    const page = this.visitPage[restaurantId] || 0;
    const start = page * this.visitLimit;
    const end = start + this.visitLimit;

    // Store total for pagination controls
    this.visitTotal[restaurantId] = visits.length;

    return visits.slice(start, end);
  }

  nextVisitPage(restaurantId: string): void {
    const page = this.visitPage[restaurantId] || 0;
    const total = this.visitTotal[restaurantId] || 0;

    if ((page + 1) * this.visitLimit >= total) return;

    this.visitPage[restaurantId] = page + 1;
    this.loadRestaurantVisits(restaurantId);
  }

  prevVisitPage(restaurantId: string): void {
    if ((this.visitPage[restaurantId] || 0) === 0) return;

    this.visitPage[restaurantId]--;
    this.loadRestaurantVisits(restaurantId);
  }

  goToVisitPage(restaurantId: string): void {
    const requestedPage = Number(this.goToVisitPageControl.value);
    if (!Number.isFinite(requestedPage)) return;

    const totalPages = this.visitTotal[restaurantId] || 0;
    const safePage = Math.min(Math.max(1, Math.trunc(requestedPage)), totalPages);

    this.visitPage[restaurantId] = safePage - 1;
    this.goToVisitPageControl.setValue(safePage, { emitEvent: false });
    this.loadRestaurantVisits(restaurantId);
  }

  toggleVisitForm(restaurantId: string): void {
    this.showVisitForm[restaurantId] = !this.showVisitForm[restaurantId];
    if (this.showVisitForm[restaurantId]) {
      this.newVisitForm.reset();
      this.newVisitForm.patchValue({
        date: new Date().toISOString().substring(0, 16),
        billAmount: 0,
        pointsEarned: 0
      });

      this.errorMsg = '';
      this.loadingCustomers = true;
      this.customerApi.getCustomers().subscribe({
        next: (res: any) => {
          const data = res?.data ?? res ?? [];
          this.customers = data;
          this.loadingCustomers = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.errorMsg = 'Could not load customers.';
          this.loadingCustomers = false;
          this.cdr.markForCheck();
        }
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
      pointsEarned: this.newVisitForm.value.pointsEarned
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
      }
    });
  }

  removeVisit(restaurantId: string, visit: IVisit): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: `Delete visit from ${visit.customer_id?.name || 'this customer'}?`
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const visitId = visit._id || visit.id;
        if (!visitId) return;

        this.loading = true;
        this.cdr.markForCheck();

        this.visitApi.deleteVisit(visitId).subscribe({
          next: () => {
            this.restaurantVisits[restaurantId] = this.restaurantVisits[restaurantId]
              .filter((v: IVisit) => (v._id || v.id) !== visitId);
            this.loading = false;
            this.cdr.markForCheck();
          },
          error: () => {
            this.errorMsg = 'Could not remove visit.';
            this.loading = false;
            this.cdr.markForCheck();
          }
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
        dateStr = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().substring(0, 16);
      }
    }

    this.editVisitForm.patchValue({
      date: dateStr,
      billAmount: visit.billAmount || 0,
      pointsEarned: visit.pointsEarned || 0
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
      pointsEarned: this.editVisitForm.value.pointsEarned
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
      }
    });
  }

  // ========================
  // PAGINATION
  // ========================

  leftPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagedRestaurants();
    }
  }

  rightPage(): void {
    if (this.currentPage < this.getTotalPages()) {
      this.currentPage++;
      this.updatePagedRestaurants();
    }
  }

  goToPage(): void {
    const requestedPage = Number(this.goToPageControl.value);
    if (!Number.isFinite(requestedPage)) return;

    const totalPages = this.getTotalPages();
    const safePage = Math.min(Math.max(1, Math.trunc(requestedPage)), totalPages);

    this.currentPage = safePage;
    this.goToPageControl.setValue(safePage, { emitEvent: false });
    this.updatePagedRestaurants();
  }

  getTotalPages(): number {
    return Math.max(1, Math.ceil(this.filteredRestaurants.length / this.limit));
  }

  private updatePagedRestaurants(): void {
    const totalPages = this.getTotalPages();
    this.currentPage = Math.min(Math.max(1, this.currentPage), totalPages);

    const start = (this.currentPage - 1) * this.limit;
    const end = start + this.limit;
    this.pagedRestaurants = this.filteredRestaurants.slice(start, end);
    this.goToPageControl.setValue(this.currentPage, { emitEvent: false });
    this.cdr.markForCheck();
  }
}