import { AfterViewInit, ChangeDetectorRef, Component, } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SquareComponent, SquareData } from './square/square.component';
import { FormsModule } from '@angular/forms';
import { DelayService } from './delay.service';
import { Complexity, getInsertComplexity, getSelectComplexity, getsShellComplexity } from './square/complexity';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule, SquareComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements AfterViewInit {
  newValue: number | undefined;
  inSort: SquareData | undefined;
  auxA: SquareData | undefined;
  auxB: SquareData | undefined;
  isRunning: boolean = false;
  speed: number = 50;
  complexity!: Complexity;
  complexityCounter: number = 0;
  
  squares: SquareData[] = []

  constructor(
    private delayService: DelayService,
    private cdRef: ChangeDetectorRef

  ){}

  ngAfterViewInit(): void {
    this.reset();
  }

  clear() {
    this.squares = [];
  }

  reset() {
    this.inSort = undefined;
    this.clear();
    for (let i=0; i < 20; i++){
      let newValue = Math.floor(Math.random() * (220)) + 5
      this.add(newValue);
      this.cdRef.detectChanges();
    }
  }

  updateDelay() {
    this.delayService.setSpeed(this.speed);
  }

  async finish() {
    const length = this.squares.length;
    const gap = 3;
    const limit = length+gap;
    this.inSort = undefined;
    for(let i=0; i<limit; i++) {
      if(i<length){
        await this.squares[i].setAsSorted(10);
      }
      if(i>=gap) {
        await this.squares[i-gap].setAsUnsorted(20);
      }
    }
    this.isRunning = false;
  }

  async start() {
    this.complexityCounter = 0;
    this.isRunning = true;
    this.inSort = undefined;
  }

  add(value: number | undefined) {
    if (value) {
      const position = this.squares.length;
      const newSquare: SquareData = new SquareData(this.delayService);
      newSquare.identity = position;
      newSquare.position = position;
      newSquare.setValue(value);
      this.squares.push(newSquare);
    }
  }

  growing() {
    let i = 0
    this.squares.sort((sqA, sqB) => sqA.value - sqB.value );
    this.squares.forEach((value: SquareData) => value.position = i++)
  }

  decreasing() {
    let i = 0
    this.squares.sort((sqA, sqB) => sqB.value - sqA.value );
    this.squares.forEach((value: SquareData) => value.position = i++)

  }

  async insertSort() {
    const lenght = this.squares.length;
    this.complexity = getInsertComplexity(lenght)
    this.complexityCounter = 0;
    this.isRunning = true;
    let j;
    let i;
    for(j=1; j < lenght; j++) {
      this.complexityCounter++;
      this.inSort = this.squares[j];
      this.squares[j].setAsSelected();
      this.inSort.setPosition(lenght+1);

      for (i=j-1; i >= 0 && this.squares[i].isGT(this.inSort); i--) {
        this.complexityCounter++;
        this.squares[i].setAsSelected();
        this.complexityCounter++;
        this.squares[i+1] = this.squares[i];
        await this.squares[i+1].setPosition(i+1);
        this.squares[i+1].setAsUnsorted();
      }
      await this.inSort.setPosition(i+1);
      await this.inSort.setAsUnsorted();
      this.squares[i+1] = this.inSort;
      this.inSort = undefined;
    }
    await this.finish();
  }

  async shellOriginal() {
    const h = this.squares.length;
    await this.shellSort(h, (h: number) => Math.floor(h / 2));
  }

  async shellKnuth() {
    let h: number
    for(h = 1; h < this.squares.length; h = 3 * h + 1){}

    await this.shellSort(h, (h: number) => (h-1)/3);
  }

  async shellSort(h: number, getGap: Function) {
    this.start()
    this.complexity = getsShellComplexity(this.squares.length)
    let i, j
    const lenght = this.squares.length    
    do {
      h = getGap(h)

      for(i = h; i < lenght; i++) {
        this.complexityCounter++;
        this.inSort = this.squares[i];
        
        await Promise.all([
          this.squares[i].setAsSelected(),
          this.squares[i-h].setAsSelected()
        ])
        await this.squares[i-h].setAsUnsorted();
        
        for(j=i; j >= h && this.squares[j-h].isGT(this.inSort); j-=h) {
          this.complexityCounter++;
          this.squares[j] = this.squares[j-h];
          this.squares[j].setAsSelected();
          await this.inSort.setPosition(lenght+1);
          await this.squares[j].setPosition(j);
          await this.squares[j].setAsUnsorted();
        }
        this.squares[j] = this.inSort;
        await this.squares[j].setPosition(j);
        await this.squares[j].setAsUnsorted();
      }
    } while(h != 1);
    this.finish();
  }

  async selectSort() {
    const lenght = this.squares.length;
    this.complexity = getSelectComplexity(lenght);
    this.complexityCounter = 0;
    this.isRunning = true;
    let j: number; 
    let i: number;
    let temp;
    for(i=0; i < lenght; i++) {
      this.complexityCounter++
      let min = i;
      await this.squares[i].setAsSelected()
      for(j=i+1; j < this.squares.length; j++) {
        this.complexityCounter++
        await this.squares[j].setAsSelected()
        if(this.squares[min].isGT(this.squares[j])) {
          if (min != i) {
            await this.squares[min].setAsUnsorted();
          }
          min = j;
          await this.squares[j].setAsMarked();
        } else {
          await this.squares[j].setAsUnsorted();
        }
      }
      temp = this.squares[min];
      await Promise.all([
        this.squares[i].setPositionDelayAfter(min),
        temp.setPositionDelayAfter(i)
      ])
      this.complexityCounter++
      this.squares[min] = this.squares[i];   
      this.squares[i].setAsUnsorted(),
      temp.setAsUnsorted()
      this.squares[i] = temp;
    }
    await this.finish()
  }

  async shellSort2() {
    let i, j, h;
    let aux: SquareData;
    const lenght = this.squares.length
    for(h = 1; h < lenght; h = 3 * h + 1){}
    do {
      h = (h-1)/3;
      for(i = h; i < lenght; i++) {
        aux = this.squares[i];
        j = i;
        while(j >= h && this.squares[j-h].isGT(aux)) {
          await Promise.all([
            this.squares[j].setAsSelected(),
            this.squares[j-h].setAsSelected()
          ])
          await this.squares[j].setPosition(lenght+2)
          await this.squares[j-h].setPosition(j);
          await this.squares[j-h].setAsUnsorted();
          this.squares[j] = await this.squares[j-h].clone();
          j -= h;
        }
        this.squares[j] = aux;
        await this.squares[j].setPosition(j)
        await this.squares[j].setAsUnsorted()
      }
    } while(h != 1)
    console.log(this.squares)
  }

  async mergeSort() {
    alert("Not implemented"); 
  }
  async quickSort() {
    alert("Not implemented");
  }
}