import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RestaurantList } from './restaurant-list';

describe('OrganizationList', () => {
  let component: RestaurantList;
  let fixture: ComponentFixture<RestaurantList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RestaurantList],
    }).compileComponents();

    fixture = TestBed.createComponent(RestaurantList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
