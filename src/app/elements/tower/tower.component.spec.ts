import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TowerComponent } from './tower.component';

describe('SquareComponent', () => {
  let component: TowerComponent;
  let fixture: ComponentFixture<TowerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TowerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TowerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
