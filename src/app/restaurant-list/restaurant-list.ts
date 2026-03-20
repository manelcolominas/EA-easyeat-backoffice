import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
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

@Component({
  selector: 'app-restaurant-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule],
  templateUrl: './restaurant-list.html',
  styleUrls: ['./restaurant-list.css'],
})
export class RestaurantList implements OnInit {
  restaurants: IRestaurant[] = [];
  filteredRestaurants: IRestaurant[] = [];
  pagedRestaurants: IRestaurant[] = [];
  searchControl = new FormControl('');
  search = true;
  loading = true;
  errorMsg = '';
  showForm = false;
  restaurantForm!: FormGroup;
  editting = false;
  restaurantEditId: string | undefined;
  expanded: { [key: string]: boolean } = {};
  limit = 2;
  currentPage = 1;
  showAllRestaurants = false;
  showAllData = false;

  showRewardForm: { [key: string]: boolean } = {};
  newRewardForm!: FormGroup;

  editingRewardId: string | null = null;
  editRewardForm!: FormGroup;

  restaurantVisits: { [key: string]: IVisit[] } = {};
  showVisitForm: { [key: string]: boolean } = {};
  newVisitForm!: FormGroup;
  editingVisitId: string | null = null;
  editVisitForm!: FormGroup;

  constructor(private api: RestaurantService, private rewardApi: RewardService, private visitApi: VisitService, private fb: FormBuilder, private cdr: ChangeDetectorRef, private dialog: MatDialog) {
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
      rating: [0, [Validators.pattern('^[0-5]+(\\.[0-9]+)?$'), Validators.min(0), Validators.max(5)]],
      monday: ['',    [Validators.pattern('(?:[01]\\d|2[0-3]):[0-5]\\d-(?:[01]\\d|2[0-3]):[0-5]\\d(?:,(?:[01]\\d|2[0-3]):[0-5]\\d-(?:[01]\\d|2[0-3]):[0-5]\\d)*')]],
      tuesday: ['',   [Validators.pattern('(?:[01]\\d|2[0-3]):[0-5]\\d-(?:[01]\\d|2[0-3]):[0-5]\\d(?:,(?:[01]\\d|2[0-3]):[0-5]\\d-(?:[01]\\d|2[0-3]):[0-5]\\d)*')]],
      wednesday: ['', [Validators.pattern('(?:[01]\\d|2[0-3]):[0-5]\\d-(?:[01]\\d|2[0-3]):[0-5]\\d(?:,(?:[01]\\d|2[0-3]):[0-5]\\d-(?:[01]\\d|2[0-3]):[0-5]\\d)*')]],
      thursday: ['',  [Validators.pattern('(?:[01]\\d|2[0-3]):[0-5]\\d-(?:[01]\\d|2[0-3]):[0-5]\\d(?:,(?:[01]\\d|2[0-3]):[0-5]\\d-(?:[01]\\d|2[0-3]):[0-5]\\d)*')]],
      friday: ['',    [Validators.pattern('(?:[01]\\d|2[0-3]):[0-5]\\d-(?:[01]\\d|2[0-3]):[0-5]\\d(?:,(?:[01]\\d|2[0-3]):[0-5]\\d-(?:[01]\\d|2[0-3]):[0-5]\\d)*')]],
      saturday: ['',  [Validators.pattern('(?:[01]\\d|2[0-3]):[0-5]\\d-(?:[01]\\d|2[0-3]):[0-5]\\d(?:,(?:[01]\\d|2[0-3]):[0-5]\\d-(?:[01]\\d|2[0-3]):[0-5]\\d)*')]],
      sunday: ['',    [Validators.pattern('(?:[01]\\d|2[0-3]):[0-5]\\d-(?:[01]\\d|2[0-3]):[0-5]\\d(?:,(?:[01]\\d|2[0-3]):[0-5]\\d-(?:[01]\\d|2[0-3]):[0-5]\\d)*')]],
      imageUrl: ['', Validators.pattern('^http[^,\\s]*(,http[^,\\s]*)*$')],
      phone: [''],
      email: [''],
      city: ['', Validators.required],
      address: [''],
      googlePlaceId: [''],
      type: ['', Validators.required], //Coordinates type
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

    this.searchControl = new FormControl('');
  }

  ngOnInit(): void {
    this.load();

    this.searchControl.valueChanges.subscribe(value => {
      const term = value?.toLowerCase() ?? '';

      term ? this.search = true : this.search = false;
      this.filteredRestaurants = this.restaurants.filter(restaurant =>
        restaurant.profile.name.toLowerCase().includes(term)
      );
    });
  }

  load(): void {
    this.loading = true;
    this.errorMsg = '';
    this.cdr.markForCheck();

    this.api.getRestaurants().subscribe({
      next: (res) => {
        this.restaurants = res;
        this.filteredRestaurants = [...this.restaurants];
        if (res.length > 2) {
          this.pagedRestaurants = this.filteredRestaurants.slice(this.currentPage*this.limit - this.limit, this.currentPage*this.limit);
        }
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
    }
    else { this.showForm = !this.showForm; }
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

  edit(restaurant: IRestaurant): void {
    this.showForm = true;
    this.editting = true;
    this.restaurantEditId = restaurant._id;

    this.restaurantForm.patchValue({
      name: restaurant.profile.name,
      description: restaurant.profile.description,
      rating: restaurant.profile.rating,
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
      categoryFastFood:restaurant.profile.category?.includes('Fast Food'),
      categoryBuffet:restaurant.profile.category?.includes('Buffet'),
      categoryFoodTruck:restaurant.profile.category?.includes('Food Truck'),
      categoryLounge:restaurant.profile.category?.includes('Lounge'),
      categoryPub:restaurant.profile.category?.includes('Pub'),
      categoryWineBar:restaurant.profile.category?.includes('Wine Bar'),
      categoryRooftop:restaurant.profile.category?.includes('Rooftop'),
      categoryBar:restaurant.profile.category?.includes('Bar'),
      categoryTaperia:restaurant.profile.category?.includes('Taperia'),
      categoryGelateria:restaurant.profile.category?.includes('Gelateria'),
      categoryEstellaMichelin:restaurant.profile.category?.includes('Estella Michelin'),
      categoryStreetFood:restaurant.profile.category?.includes('Street Food'),
      monday: restaurant.profile.timetable?.monday ? restaurant.profile.timetable.monday.map(slot => `${slot.open}-${slot.close}`).join(',') : '',
      tuesday: restaurant.profile.timetable?.tuesday ? restaurant.profile.timetable.tuesday.map(slot => `${slot.open}-${slot.close}`).join(',') : '',
      wednesday: restaurant.profile.timetable?.wednesday ? restaurant.profile.timetable.wednesday.map(slot => `${slot.open}-${slot.close}`).join(',') : '',
      thursday: restaurant.profile.timetable?.thursday ? restaurant.profile.timetable.thursday.map(slot => `${slot.open}-${slot.close}`).join(',') : '',
      friday: restaurant.profile.timetable?.friday ? restaurant.profile.timetable.friday.map(slot => `${slot.open}-${slot.close}`).join(',') : '',
      saturday: restaurant.profile.timetable?.saturday ? restaurant.profile.timetable.saturday.map(slot => `${slot.open}-${slot.close}`).join(',') : '',
      sunday: restaurant.profile.timetable?.sunday ? restaurant.profile.timetable.sunday.map(slot => `${slot.open}-${slot.close}`).join(',') : '',
      imageUrl: restaurant.profile.image ? restaurant.profile.image : '',
      phone: restaurant.profile.contact?.phone || '',
      email: restaurant.profile.contact?.email || '',
      city: restaurant.profile.location?.city || '',
      address: restaurant.profile.location?.address || '',
      googlePlaceId: restaurant.profile.location?.googlePlaceId || '',
      type: restaurant.profile.location?.coordinates?.type || '',
      lat: restaurant.profile.location?.coordinates?.coordinates[1] || '',
      lon: restaurant.profile.location?.coordinates?.coordinates[0] || '',
      employees: restaurant.employees ? restaurant.employees.join(', ') : '',
      dishes: restaurant.dishes ? restaurant.dishes.join(', ') : '',
      statistics: restaurant.statistics || '',
      badges: restaurant.badges ? restaurant.badges.join(', ') : '',
    });
  }

  save(): void {
    if (this.restaurantForm.invalid) return;

    const monday: { open: string; close: string }[] | undefined = this.restaurantForm.value.monday ? this.restaurantForm.value.monday.split(',').map((slot: string) => {
      const [open, close] = slot.split('-');
      return { open, close };
    }) : undefined;

    const tuesday: { open: string; close: string }[] | undefined = this.restaurantForm.value.tuesday ? this.restaurantForm.value.tuesday.split(',').map((slot: string) => {
      const [open, close] = slot.split('-');
      return { open, close };
    }) : undefined;

    const wednesday: { open: string; close: string }[] | undefined = this.restaurantForm.value.wednesday ? this.restaurantForm.value.wednesday.split(',').map((slot: string) => {
      const [open, close] = slot.split('-');
      return { open, close };
    }) : undefined;

    const thursday: { open: string; close: string }[] | undefined = this.restaurantForm.value.thursday ? this.restaurantForm.value.thursday.split(',').map((slot: string) => {
      const [open, close] = slot.split('-');
      return { open, close };
    }) : undefined;

    const friday: { open: string; close: string }[] | undefined = this.restaurantForm.value.friday ? this.restaurantForm.value.friday.split(',').map((slot: string) => {
      const [open, close] = slot.split('-');
      return { open, close };
    }) : undefined;

    const saturday: { open: string; close: string }[] | undefined = this.restaurantForm.value.saturday ? this.restaurantForm.value.saturday.split(',').map((slot: string) => {
      const [open, close] = slot.split('-');
      return { open, close };
    }) : undefined;

    const sunday: { open: string; close: string }[] | undefined = this.restaurantForm.value.sunday ? this.restaurantForm.value.sunday.split(',').map((slot: string) => {
      const [open, close] = slot.split('-');
      return { open, close };
    }) : undefined;

    let category: string[] | undefined = undefined;

    if (this.restaurantForm.value.categoryItalià) category = [...(category || []), 'Italià'];
    if (this.restaurantForm.value.categoryJaponès) category = [...(category || []), 'Japonès'];
    if (this.restaurantForm.value.categorySushi) category = [...(category || []), 'Sushi'];
    if (this.restaurantForm.value.categoryMexicà) category = [...(category || []), 'Mexicà'];
    if (this.restaurantForm.value.categoryXinès) category = [...(category || []), 'Xinès'];
    if (this.restaurantForm.value.categoryIndi) category = [...(category || []), 'Indi'];
    if (this.restaurantForm.value.categoryTailandès) category = [...(category || []), 'Tailandès'];
    if (this.restaurantForm.value.categoryFrancès) category = [...(category || []), 'Francès'];
    if (this.restaurantForm.value.categoryEspanyol) category = [...(category || []), 'Espanyol'];
    if (this.restaurantForm.value.categoryGrec) category = [...(category || []), 'Grec'];
    if (this.restaurantForm.value.categoryTurc) category = [...(category || []), 'Turc'];
    if (this.restaurantForm.value.categoryCoreà) category = [...(category || []), 'Coreà'];
    if (this.restaurantForm.value.categoryVietnamita) category = [...(category || []), 'Vietnamita'];
    if (this.restaurantForm.value.categoryAlemany) category = [...(category || []), 'Alemany'];
    if (this.restaurantForm.value.categoryBrasileny) category = [...(category || []), 'Brasileny'];
    if (this.restaurantForm.value.categoryPeruà) category = [...(category || []), 'Peruà'];
    if (this.restaurantForm.value.categoryVegà) category = [...(category || []), 'Vegà'];
    if (this.restaurantForm.value.categoryVegetarià) category = [...(category || []), 'Vegetarià'];
    if (this.restaurantForm.value.categoryMarisc) category = [...(category || []), 'Marisc'];
    if (this.restaurantForm.value.categoryCarn) category = [...(category || []), 'Carn'];
    if (this.restaurantForm.value.categoryPizzeria) category = [...(category || []), 'Pizzeria'];
    if (this.restaurantForm.value.categoryCafeteria) category = [...(category || []), 'Cafeteria'];
    if (this.restaurantForm.value.categoryRamen) category = [...(category || []), 'Ramen'];
    if (this.restaurantForm.value.categoryGlutenFree) category = [...(category || []), 'Gluten Free'];
    if (this.restaurantForm.value.categoryGourmet) category = [...(category || []), 'Gourmet'];
    if (this.restaurantForm.value.categoryFastFood) category = [...(category || []), 'Fast Food'];
    if (this.restaurantForm.value.categoryBuffet) category = [...(category || []), 'Buffet'];
    if (this.restaurantForm.value.categoryFoodTruck) category = [...(category || []), 'Food Truck'];
    if (this.restaurantForm.value.categoryLounge) category = [...(category || []), 'Lounge'];
    if (this.restaurantForm.value.categoryPub) category = [...(category || []), 'Pub'];
    if (this.restaurantForm.value.categoryWineBar) category = [...(category || []), 'Wine Bar'];
    if (this.restaurantForm.value.categoryRooftop) category = [...(category || []), 'Rooftop'];
    if (this.restaurantForm.value.categoryBar) category = [...(category || []), 'Bar'];
    if (this.restaurantForm.value.categoryTaperia) category = [...(category || []), 'Taperia'];
    if (this.restaurantForm.value.categoryGelateria) category = [...(category || []), 'Gelateria'];
    if (this.restaurantForm.value.categoryEstellaMichelin) category = [...(category || []), 'Estella Michelin'];
    if (this.restaurantForm.value.categoryStreetFood) category = [...(category || []), 'Street Food'];

    if (!category || category.length === 0 || category === undefined) return;

    const newRestaurant: Partial<IRestaurant> = {
      profile: {
        timetable: {
          monday: monday,
          tuesday: tuesday,
          wednesday: wednesday,
          thursday: thursday,
          friday: friday,
          saturday: saturday,
          sunday: sunday,
        },
        contact: {
          phone: this.restaurantForm.value.phone === '' ? undefined : this.restaurantForm.value.phone,
          email: this.restaurantForm.value.email === '' ? undefined : this.restaurantForm.value.email,
        },
        location: {
          coordinates: {
            type: this.restaurantForm.value.type === '' ? undefined : this.restaurantForm.value.type,
            coordinates: [
              this.restaurantForm.value.lon === '' ? undefined : this.restaurantForm.value.lon,
              this.restaurantForm.value.lat === '' ? undefined : this.restaurantForm.value.lat
            ],
          },
          city: this.restaurantForm.value.city === '' ? undefined : this.restaurantForm.value.city,
          address: this.restaurantForm.value.address === '' ? undefined : this.restaurantForm.value.address,
          googlePlaceId: this.restaurantForm.value.googlePlaceId === '' ? undefined : this.restaurantForm.value.googlePlaceId,
        },
        name: this.restaurantForm.value.name,
        description: this.restaurantForm.value.description,
        rating: this.restaurantForm.value.rating,
        category: category,
        image: this.restaurantForm.value.imageUrl === '' ? undefined : this.restaurantForm.value.imageUrl.split(',').map((slot: string) => {
          return slot;
        }),
      },
      employees: undefined,
      dishes: undefined,
      rewards: undefined,
      statistics: this.restaurantForm.value.statistics ? this.restaurantForm.value.statistics : undefined,
      badges: undefined,
    };

    if (this.editting && this.restaurantEditId) {
      this.api.updateRestaurant(this.restaurantEditId, newRestaurant)
        .subscribe({
          next: () => {
            this.resetForm();
            this.load();
          },
          error: () => {
            this.errorMsg = 'Could not update the restaurant.';
          }
        });

    } else {
      this.api.createRestaurant(newRestaurant)
        .subscribe({
          next: () => {
            this.resetForm();
            this.load();
          },
          error: () => {
            this.errorMsg = 'Could not create the restaurant.';
          }
        });
    }
  }

  toggleExpand(id: string): void {
    this.expanded[id] = !this.expanded[id];
    if (this.expanded[id] && !this.restaurantVisits[id]) {
      this.loading = true;
      this.visitApi.getVisitsByRestaurantId(id).subscribe({
        next: (visits) => {
          this.restaurantVisits[id] = visits;
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.errorMsg = 'Could not load visits.';
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

  confirmDelete(id: string, name?: string) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: name
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.delete(id);
      }
    });
  }

  delete(id: string): void {
    this.errorMsg = '';
    this.loading = true;
    this.cdr.markForCheck();

    this.api.deleteRestaurant(id).subscribe({
      next: () => {
        this.load();
      },
      error: () => {
        this.errorMsg = 'Error delete';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
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
    const rewardName = reward.name || 'this reward';
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: `Delete ${rewardName}?`
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const rewardId = reward._id || reward.id;
        if (!rewardId) return;

        this.loading = true;
        this.cdr.markForCheck();

        this.rewardApi.deleteReward(rewardId).subscribe({
          next: () => {
            if (restaurant.rewards) {
              restaurant.rewards = restaurant.rewards.filter((r: any) => (r._id || r.id || r) !== rewardId);
            }
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
      pointsRequired: reward.pointsRequired !== undefined ? reward.pointsRequired : (reward.points || 0)
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
        if (restaurant.rewards) {
          const index = restaurant.rewards.findIndex((r: any) => (r._id || r.id || r) === targetRewardId);
          if (index !== -1) {
            restaurant.rewards[index] = updatedReward;
          }
        }
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

  toggleVisitForm(restaurantId: string): void {
    this.showVisitForm[restaurantId] = !this.showVisitForm[restaurantId];
    if (this.showVisitForm[restaurantId]) {
      this.newVisitForm.reset();
      this.newVisitForm.patchValue({ 
        date: new Date().toISOString().substring(0, 16),
        billAmount: 0, 
        pointsEarned: 0 
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
      next: (savedVisit) => {
        if (!this.restaurantVisits[restaurantId]) this.restaurantVisits[restaurantId] = [];
        this.showVisitForm[restaurantId] = false;
        
        this.visitApi.getVisitsByRestaurantId(restaurantId).subscribe(visits => {
           this.restaurantVisits[restaurantId] = visits;
           this.loading = false;
           this.cdr.markForCheck();
        });
      },
      error: () => {
        this.errorMsg = 'Could not add visit.';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  removeVisit(restaurantId: string, visit: IVisit): void {
    const customerName = visit.customer_id?.name || 'this customer';
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: `Delete visit from ${customerName}?`
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const visitId = visit._id || visit.id;
        if (!visitId) return;

        this.loading = true;
        this.cdr.markForCheck();

        this.visitApi.deleteVisit(visitId).subscribe({
          next: () => {
            if (this.restaurantVisits[restaurantId]) {
              this.restaurantVisits[restaurantId] = this.restaurantVisits[restaurantId].filter((v: IVisit) => (v._id || v.id) !== visitId);
            }
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
        this.visitApi.getVisitsByRestaurantId(restaurantId).subscribe({
           next: (visits) => {
             this.restaurantVisits[restaurantId] = visits;
             this.editingVisitId = null;
             this.loading = false;
             this.cdr.markForCheck();
           }
        });
      },
      error: () => {
        this.errorMsg = 'Could not update visit.';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  leftPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.load();
    }
  }

  rightPage(): void {
    if (this.currentPage * 2 < this.filteredRestaurants.length) {
      this.currentPage++;
      this.load();
    }
  }
}
