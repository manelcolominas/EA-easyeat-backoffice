import { TestBed } from '@angular/core/testing';

import { RestaurantService } from './restaurant.service';

describe('Restaurant', () => {
  let service: RestaurantService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RestaurantService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
