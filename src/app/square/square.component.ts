import { Component, Input } from '@angular/core';
import { DelayService } from './delay.service/delay.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'square',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './square.component.html',
  styleUrl: './square.component.css'
})
export class SquareComponent {
    @Input() 
    value: number = 0;

    @Input()
    identity: number | undefined;

    @Input()
    position: number = 0;

    @Input()
    color: string | undefined;

    @Input()
    squareWidth: number = 60;
}

export class SquareData {
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
  async clone(): Promise<SquareData> {
    const newSquare: SquareData = new SquareData(this.delayService);
    await newSquare.setPosition(this.position);
    newSquare.value = this.value;
    newSquare.color = this.color;
    return newSquare;
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
    return ++SquareData.lastId
  }

  
  isGT(other: SquareData): boolean {
    return this.value > other.value;
  }

  isLT(other: SquareData): boolean {
    return this.value < other.value;
  }
}
