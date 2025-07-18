import { Component, Input } from '@angular/core';
import { DelayService } from '../../services/delay.service/delay.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'element-tower',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tower.component.html',
  styleUrl: './tower.component.css'
})
export class TowerComponent {
  heightPercentage: number = 0;

  ngOnChanges() {
    const screenHeight = window.innerHeight;
    this.heightPercentage = (this.value / screenHeight) * 100;
  }

  @Input() 
  value: number = 0;

  @Input()
  identity: number | undefined;

  @Input()
  position: number = 0;

  @Input()
  color: string | undefined;

  @Input()
  towerWidth: number = 60;
}

export class TowerData {
  static lastId: number = 0;

  identity: number = this.generateId();
  value: number = 0;
  position: number = 0;
  color: string | undefined;

  constructor(
    private delayService: DelayService
  ) { 
    this.setAsUnsorted()
  }
  async clone(): Promise<TowerData> {
    const newTowers: TowerData = new TowerData(this.delayService);
    await newTowers.setPosition(this.position);
    newTowers.value = this.value;
    newTowers.color = this.color;
    return newTowers;
  }

  async setValue(value: number) {
    await this.delayService.delay();
    this.value = value;
  }

  async setPosition(newPosition: number) {
    await this.delayService.delay();
    this.position = newPosition;
  }

  async setPositionDelayAfter(newPosition: number) {
    this.position = newPosition;
    await this.delayService.delay();
  }
  
  async setAsSorted(ms: number | undefined = 20) {
    await this.delayService.delay(ms);
    this.color = "green"
  } 

  async setAsSelected(after: boolean = false) {
    if(after) {
      await this.delayService.delay();
    }
    this.color = "blue"
    if (!after) {
      await this.delayService.delay();
    }
  }

  async setAsMarked() {
    this.color = "red"
  }

  async setAsUnsorted(ms: number | undefined = undefined) {
    await this.delayService.delay(ms);
    this.color = "orange"
  }

  async setAsGhost() {
    this.color = "#ffd890"
    await this.delayService.delay();
  }

  private generateId() {
    return ++TowerData.lastId
  }

  
  isGt(other: TowerData): boolean {
    return this.value > other.value;
  }

  isLt(other: TowerData): boolean {
    return this.value < other.value;
  }

  isLte(other: TowerData): boolean {
    return this.value <= other.value;
  }
}
