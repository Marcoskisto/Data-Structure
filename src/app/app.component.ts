import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, linkedSignal, ViewChild, } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SquareComponent, SquareData } from './square/square.component';
import { FormsModule } from '@angular/forms';
import { DelayService } from './square/delay.service/delay.service';
import { Complexity, getInsertComplexity, getQuickComplexity, getSelectComplexity, getsMergeComplexity, getsShellComplexity } from './square/complexity';


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
  isRunning: boolean = false;
  speed: number = 60;
  complexity!: Complexity;
  complexityCounter: number = 0;
  squares: SquareData[] = [];
  squaresLength: number = 20;
  minValue: number = 5;
  maxValue: number = 700;
  minSquaresQty: number = 10;
  maxSquaresQty: number = 150;
  squareWidth: number = 60;

  @ViewChild('boardRef', { static: true }) boardRef!: ElementRef<HTMLDivElement>;

  constructor(
    private delayService: DelayService,
    private cdRef: ChangeDetectorRef

  ){}

  ngAfterViewInit(): void {
    this.reset();
    this.updateDelay()
  }

  clear() {
    this.squares = [];
  }

  reset() {
    this.inSort = undefined;
    this.clear();
    for (let i=0; i < this.squaresLength; i++){
      let newValue = Math.floor(Math.random() * (this.maxValue)) + this.minValue
      this.add(newValue);
      this.cdRef.detectChanges();
    }
  }

  updateDelay() {
    this.delayService.setSpeed(this.speed);
  }

  updateSquaresLength() {
    let diff: number = this.squaresLength - this.squares.length;
      while(diff > 0) {
        this.add(Math.floor(Math.random() * (this.maxValue)) + this.minValue);
        diff = this.squaresLength - this.squares.length;
      }
      while(diff < 0) {
        this.squares.pop();
        diff = this.squaresLength - this.squares.length;
      }
      this.adjustSquareSize();
  }

  private adjustSquareSize() {
    const defaultWidth = 60;
    const containerWidth: number = this.boardRef?.nativeElement?.offsetWidth - 100;
    const newSquareWidth = containerWidth / (this.squaresLength+2);
    this.squareWidth = newSquareWidth > defaultWidth ? defaultWidth: newSquareWidth;
  }
  
  async finish() {
    const length = this.squares.length;
    const gap = Math.floor(length/5);
    const limit = length+gap;
    this.inSort = undefined;
    for(let i=0; i<limit; i++) {
      if(i<length){
        await this.squares[i].setAsSorted(15/(this.squaresLength/10));
      }
      if(i>=gap) {
        await this.squares[i-gap].setAsUnsorted(30/(this.squaresLength/10));
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
      this.squares[j].setAsSelected();
      this.inSort = await this.squares[j].clone();

      for (i=j-1; i >= 0 && this.squares[i].isGt(this.inSort); i--) {
        this.complexityCounter++;
        await this.inSort.setPosition(lenght+1);

        await this.squares[i].setAsSelected(true);
        this.complexityCounter++;
        this.squares[i+1] = await this.squares[i].clone();
        Promise.all([
          this.squares[i+1].setPosition(i+1),
          this.squares[i].setAsUnsorted(),
          this.squares[i+1].setAsUnsorted()
        ])
      }
      this.squares[i+1] = await this.inSort.clone();
      this.inSort = undefined;
      await this.squares[i+1].setPosition(i+1);
      await this.squares[i+1].setAsUnsorted();
    }
    await this.finish();
  }

  async shellOriginal() {
    const h = this.squares.length;
    await this.shellSort(h, (h: number) => Math.floor(h / 2));
  }

  async shellKnuth() {
    let h: number;
    for(h = 1; h < this.squares.length; h = 3 * h + 1){}

    await this.shellSort(h, (h: number) => (h-1)/3);
  }

  async shellSort(h: number, getGap: Function) {
    this.start();
    this.complexity = getsShellComplexity(this.squares.length)
    let i, j;
    const lenght = this.squares.length;   
    do {
      h = getGap(h);

      for(i = h; i < lenght; i++) {
        this.complexityCounter++;
        this.inSort = await this.squares[i].clone();
        
        await Promise.all([
          this.squares[i].setAsSelected(),
          this.squares[i-h].setAsSelected()
        ])
        await this.squares[i-h].setAsUnsorted();
        
        for(j=i; j >= h && this.squares[j-h].isGt(this.inSort); j-=h) {
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
        if(this.squares[min].isGt(this.squares[j])) {
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
      // this.complexityCounter++
      this.squares[min] = this.squares[i];   
      this.squares[i].setAsUnsorted(),
      temp.setAsUnsorted()
      this.squares[i] = temp;
    }
    await this.finish()
  }

  async handleMergeSort() {
    this.complexity = getsMergeComplexity(this.squaresLength)
    await this.start()
    await this.mergeSort(this.squares, 0, this.squares.length-1)
    await this.finish()
  }

  async mergeSort(arr: SquareData[], left: number, right: number) {
    if (left >= right) return;
    const middle = Math.floor(left + (right - left)/2);
    await this.mergeSort(arr, left, middle);
    await this.mergeSort(arr, middle + 1, right);
    await this.merge(arr, left,  middle, right);
  }

  async merge(arr: SquareData[], left: number, middle: number, right: number) {

    for(let i = 0; i < arr.length; i++) {
      if(i < left || i > right) {
        arr[i].setAsUnsorted();
      } else {
        arr[i].setAsSelected();
      }
    }

    const leftArr: SquareData[] = arr.slice(left, middle + 1);
    const rightArr: SquareData[] = arr.slice(middle + 1, right + 1);

    let i = left;
    let indexL: number = 0;
    let indexR: number = 0;

    while(indexL < leftArr.length && indexR < rightArr.length) {
      this.complexityCounter++;
      if (leftArr[indexL].isLt(rightArr[indexR])) {
        arr[i] = await leftArr[indexL].clone();
        arr[i].setPosition(i);
        indexL++;

      } else {
        arr[i] = await rightArr[indexR].clone();
        arr[i].setPosition(i);
        indexR++;
      }
      i++;
    }

    while(indexL < leftArr.length) {
      this.complexityCounter++;
      arr[i] = await leftArr[indexL].clone();
      arr[i].setPosition(i);
      indexL++;
      i++;
    }

    while(indexR < rightArr.length) {
      this.complexityCounter++;
      arr[i] = await rightArr[indexR].clone();
      arr[i].setPosition(i);
      indexR++;
      i++;
    }
  }

  async handleQuickSort(useRandom: boolean = false) {
    this.complexity = getQuickComplexity(this.squaresLength, useRandom);
    this.start();
    await this.quickSort(0, this.squaresLength-1, this.squares, useRandom)
    this.finish();
  }

  async quickSort(indexL: number, indexR: number, arr: SquareData[], useRandom: boolean) {

    if (indexL < indexR) {
      const pivoIndex: number = useRandom 
        ? await this.partitionRandom(indexL, indexR, arr)
        : await this.partition(indexL, indexR, arr);
      await this.quickSort(indexL, pivoIndex - 1, arr, useRandom);
      await this.quickSort(pivoIndex + 1, indexR, arr, useRandom);
    }
  }
  async quickSortRandom(indexL: number, indexR: number, arr: SquareData[]) {

    if (indexL < indexR) {
      const pivoIndex: number = await this.partitionRandom(indexL, indexR, arr);
      await this.quickSortRandom(indexL, pivoIndex - 1, arr);
      await this.quickSortRandom(pivoIndex + 1, indexR, arr);
    }
  }

  async partitionRandom(indexL: number, indexR: number, arr: SquareData[]) {
    const i: number =   Math.floor(Math.random() * (indexR - indexL + 1)) + indexL;
    await Promise.all([
      arr[indexR].setAsMarked(),
      arr[i].setAsMarked()
    ])
    await Promise.all([
      arr[indexR].setPosition(i),
      arr[i].setPosition(indexR)
    ])
    const aux: SquareData = arr[indexR];
    arr[indexR] = await arr[i].clone();
    arr[i] = aux;
    await arr[i].setAsUnsorted();
    return this.partition(indexL, indexR, arr)
  }

  async partition(indexL: number, indexR: number, arr: SquareData[]): Promise<number> {
    let aux: SquareData;
    await arr[indexR].setAsMarked();
    const pivo = await arr[indexR];
    let i:number;
    let j:number;

    for (i=indexL, j=indexL; i < indexR; i++) {
      await Promise.all([
        arr[i].setAsSelected(),
        arr[j].setAsSelected()
      ])
      
      this.complexityCounter++
      if (arr[i].isLte(pivo)) {
        await Promise.all([
          arr[i].setPosition(j),
          arr[j].setPosition(i)
        ])
        aux = arr[i];
        arr[i] = await arr[j].clone();
        arr[j] = aux;
        await arr[j].setAsUnsorted();
        j++;
      }
     await arr[i].setAsUnsorted();
    }
    arr[j].setAsSelected();
    arr[indexR] = await arr[j].clone();
    arr[j] = pivo;
    await Promise.all([
      arr[indexR].setPosition(indexR),
      arr[j].setPosition(j)
    ]);
    await Promise.all([
      arr[j].setAsUnsorted(),
      arr[indexR].setAsUnsorted()
    ])
    return j;
  }
}