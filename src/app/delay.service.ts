import { Injectable } from '@angular/core';

const minDelay = 50;
const maxDelay = 1000;

@Injectable({
  providedIn: 'root'
})
export class DelayService {
  private currentDelay = 500;
  constructor() { }

  private setDelay(ms: number) {
    console.log(ms)
    this.currentDelay = ms;
  }

  setSpeed(speed: number) {
    const normalizedSpeed = speed / 100;
    const inverted = 1 - normalizedSpeed;
    const time = minDelay + (maxDelay - minDelay) * Math.pow(inverted, 2);
    this.setDelay(time);
  }
  
  getDelay() {
    return this.currentDelay;
  }
  
  async delay(ms?: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms ?? this.currentDelay));
  }
}
