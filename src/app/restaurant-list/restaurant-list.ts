import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RestaurantService } from '../services/restaurant.service';
import { IRestaurant } from '../models/restaurant.model';
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
  searchControl = new FormControl('');
  loading = true;
  errorMsg = '';
  showForm = false;
  restaurantForm!: FormGroup;
  editting = false;
  restaurantEditId: string | undefined;
  expanded: { [key: string]: boolean } = {};
  limit = 10;
  showAllRestaurants = false;
  
  constructor(private api: RestaurantService, private fb: FormBuilder, private cdr: ChangeDetectorRef, private dialog: MatDialog) {
    this.restaurantForm = this.fb.group({
      name: ['', Validators.required],
    });

    this.searchControl = new FormControl('');
  }

  ngOnInit(): void {
    this.load();

    this.searchControl.valueChanges.subscribe(value => {
      const term = value?.toLowerCase() ?? '';
  
      this.filteredRestaurants = this.restaurants.filter(restaurant =>
        restaurant.profile.name.toLowerCase().includes(term)
      );
    }); 
  }

  load(): void {
    this.loading = true;
    this.errorMsg = '';
    this.cdr.detectChanges();

    this.api.getRestaurants().subscribe({
      next: (res) => {
        this.restaurants = res;
        this.filteredRestaurants = [...this.restaurants];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMsg = 'Could not load restaurants.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  trackById(_index: number, restaurant: IRestaurant): string | undefined {
    return restaurant._id;
  }

  showRestaurantForm(): void {
    this.showForm = true;
  }

  showMore(): void {
  this.showAllRestaurants = true;
  } 

  get visibleRestaurants(): IRestaurant[] {
    if (this.showAllRestaurants) {
      return this.filteredRestaurants;
    }
    return this.filteredRestaurants.slice(0, this.limit);
  }

  edit(restaurant: IRestaurant): void {
    this.showForm = true;
    this.editting = true;
    this.restaurantEditId = restaurant._id;

    this.restaurantForm.patchValue({
      name: restaurant.profile.name
    });
  }

  // Function save not yet implemented
  //
  // save(): void {
  //   if (this.restaurantForm.invalid) return;

  //   const name: string = this.restaurantForm.value.name;

  //   if (this.editting && this.restaurantEditId) {

  //     this.api.updateRestaurant(this.restaurantEditId, name)
  //       .subscribe({
  //         next: () => {
  //           this.resetForm();
  //           this.load();
  //         },
  //         error: () => {
  //           this.errorMsg = 'Could not update the restaurant.';
  //         }
  //       });

  //   } else {
  //     this.api.createRestaurant(name)
  //       .subscribe({
  //         next: () => {
  //           this.resetForm();
  //           this.load();
  //         },
  //         error: () => {
  //           this.errorMsg = 'Could not create the restaurant.';
  //         }
  //       });
  //   }
  // }

  toggleExpand(id: string): void {
    this.expanded[id] = !this.expanded[id];
  }

  resetForm(): void {
    this.showForm = false;
    this.editting = false;
    this.restaurantEditId = undefined;
    this.restaurantForm.reset();
  }

  // Function editRestaurant not yet implemented
  //
  // editRestaurant(restaurant: IRestaurant) {
  //   const newName = prompt('New name:', restaurant.profile.name);

  //   if (newName && newName.trim() !== '' && restaurant._id != null) {
  //     this.api.updateRestaurant(restaurant._id, newName)
  //       .subscribe(() => { restaurant.profile.name = newName; });
  //   }
  // }

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

    this.api.deleteRestaurant(id).subscribe({
      next: () => {
        this.load();
      },
      error: () => {
        this.errorMsg = 'Error delete';
        this.loading = false;
      }
    });
  }
}
