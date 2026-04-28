import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';

import { Dishes } from './dishes';
import { DishService } from '../services/dish.service';
import { RestaurantService } from '../services/restaurant.service';

describe('Dishes', () => {
  let component: Dishes;
  let fixture: ComponentFixture<Dishes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dishes],
      providers: [
        {
          provide: DishService,
          useValue: {
            getDishes: () => of({ data: [], meta: { total: 0, page: 1, limit: 200, totalPages: 1 } }),
            getDeletedDishes: () => of({ data: [], meta: { total: 0, page: 1, limit: 200, totalPages: 1 } }),
            createDish: () => of({}),
            updateDish: () => of({}),
            softDeleteDish: () => of({}),
            restoreDish: () => of({}),
          },
        },
        {
          provide: RestaurantService,
          useValue: {
            getRestaurants: () => of([]),
          },
        },
        {
          provide: MatDialog,
          useValue: {
            open: () => ({ afterClosed: () => of(false) }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Dishes);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
