import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, linkedSignal, ViewChild, } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TowerComponent, TowerData } from '../../elements/tower/tower.component';
import { FormsModule } from '@angular/forms';
import { DelayService } from '../../services/delay.service/delay.service';
import { Complexity, getInsertComplexity, getQuickComplexity, getSelectComplexity, getsMergeComplexity, getsShellComplexity } from '../../elements/tower/complexity';


@Component({
  selector: 'page-sorting',
  imports: [FormsModule, TowerComponent, CommonModule],
  templateUrl: './sorting.component.html',
  styleUrl: './sorting.component.css'
})
export class SortingComponent implements AfterViewInit {
  newValue: number | undefined;
  inSort: TowerData | undefined;
  isRunning: boolean = false;
  speed: number = 60;
  complexity!: Complexity;
  complexityCounter: number = 0;
  towers: TowerData[] = [];
  towersLength: number = 20;
  minValue: number = 5;
  maxValue: number = 700;
  minTowersQty: number = 10;
  maxTowersQty: number = 150;
  towerWidth: number = 60;

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
    this.towers = [];
  }

  reset() {
    this.inSort = undefined;
    this.clear();
    for (let i=0; i < this.towersLength; i++){
      let newValue = Math.floor(Math.random() * (this.maxValue)) + this.minValue
      this.add(newValue);
      this.cdRef.detectChanges();
    }
  }

  updateDelay() {
    this.delayService.setSpeed(this.speed);
  }

  updateTowersLength() {
    let diff: number = this.towersLength - this.towers.length;
      while(diff > 0) {
        this.add(Math.floor(Math.random() * (this.maxValue)) + this.minValue);
        diff = this.towersLength - this.towers.length;
      }
      while(diff < 0) {
        this.towers.pop();
        diff = this.towersLength - this.towers.length;
      }
      this.adjustSquareSize();
  }

  private adjustSquareSize() {
    const defaultWidth = 60;
    const containerWidth: number = this.boardRef?.nativeElement?.offsetWidth - 100;
    const newSquareWidth = containerWidth / (this.towersLength+2);
    this.towerWidth = newSquareWidth > defaultWidth ? defaultWidth: newSquareWidth;
  }
  
  async finish() {
    const length = this.towers.length;
    const gap = Math.floor(length/5);
    const limit = length+gap;
    this.inSort = undefined;
    for(let i=0; i<limit; i++) {
      if(i<length){
        await this.towers[i].setAsSorted(15/(this.towersLength/10));
      }
      if(i>=gap) {
        await this.towers[i-gap].setAsUnsorted(30/(this.towersLength/10));
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
      const position = this.towers.length;
      const newSquare: TowerData = new TowerData(this.delayService);
      newSquare.identity = position;
      newSquare.position = position;
      newSquare.setValue(value);
      this.towers.push(newSquare);
    }
  }

  growing() {
    let i = 0
    this.towers.sort((sqA, sqB) => sqA.value - sqB.value );
    this.towers.forEach((value: TowerData) => value.position = i++)
  }

  decreasing() {
    let i = 0
    this.towers.sort((sqA, sqB) => sqB.value - sqA.value );
    this.towers.forEach((value: TowerData) => value.position = i++)

  }

  async insertSort() {
    const lenght = this.towers.length;
    this.complexity = getInsertComplexity(lenght)
    this.complexityCounter = 0;
    this.isRunning = true;
    let j;
    let i;
    for(j=1; j < lenght; j++) {
      this.complexityCounter++;
      this.towers[j].setAsSelected();
      this.inSort = await this.towers[j].clone();

      for (i=j-1; i >= 0 && this.towers[i].isGt(this.inSort); i--) {
        this.complexityCounter++;
        await this.inSort.setPosition(lenght+1);

        await this.towers[i].setAsSelected(true);
        this.complexityCounter++;
        this.towers[i+1] = await this.towers[i].clone();
        Promise.all([
          this.towers[i+1].setPosition(i+1),
          this.towers[i].setAsUnsorted(),
          this.towers[i+1].setAsUnsorted()
        ])
      }
      this.towers[i+1] = await this.inSort.clone();
      this.inSort = undefined;
      await this.towers[i+1].setPosition(i+1);
      await this.towers[i+1].setAsUnsorted();
    }
    await this.finish();
  }

  async shellOriginal() {
    const h = this.towers.length;
    await this.shellSort(h, (h: number) => Math.floor(h / 2));
  }

  async shellKnuth() {
    let h: number;
    for(h = 1; h < this.towers.length; h = 3 * h + 1){}

    await this.shellSort(h, (h: number) => (h-1)/3);
  }

  async shellSort(h: number, getGap: Function) {
    this.start();
    this.complexity = getsShellComplexity(this.towers.length)
    let i, j;
    const lenght = this.towers.length;   
    do {
      h = getGap(h);

      for(i = h; i < lenght; i++) {
        this.complexityCounter++;
        this.inSort = await this.towers[i].clone();
        
        await Promise.all([
          this.towers[i].setAsSelected(),
          this.towers[i-h].setAsSelected()
        ])
        await this.towers[i-h].setAsUnsorted();
        
        for(j=i; j >= h && this.towers[j-h].isGt(this.inSort); j-=h) {
          this.complexityCounter++;
          this.towers[j] = this.towers[j-h];
          this.towers[j].setAsSelected();
          await this.inSort.setPosition(lenght+1);
          await this.towers[j].setPosition(j);
          await this.towers[j].setAsUnsorted();
        }
        this.towers[j] = this.inSort;
        await this.towers[j].setPosition(j);
        await this.towers[j].setAsUnsorted();
      }
    } while(h != 1);
    this.finish();
  }

  async selectSort() {
    const lenght = this.towers.length;
    this.complexity = getSelectComplexity(lenght);
    this.complexityCounter = 0;
    this.isRunning = true;
    let j: number; 
    let i: number;
    let temp;
    for(i=0; i < lenght; i++) {
      this.complexityCounter++
      let min = i;
      await this.towers[i].setAsSelected()
      for(j=i+1; j < this.towers.length; j++) {
        this.complexityCounter++
        await this.towers[j].setAsSelected()
        if(this.towers[min].isGt(this.towers[j])) {
          if (min != i) {
            await this.towers[min].setAsUnsorted();
          }
          min = j;
          await this.towers[j].setAsMarked();
        } else {
          await this.towers[j].setAsUnsorted();
        }
      }
      temp = this.towers[min];
      await Promise.all([
        this.towers[i].setPositionDelayAfter(min),
        temp.setPositionDelayAfter(i)
      ])
      // this.complexityCounter++
      this.towers[min] = this.towers[i];   
      this.towers[i].setAsUnsorted(),
      temp.setAsUnsorted()
      this.towers[i] = temp;
    }
    await this.finish()
  }

  async handleMergeSort() {
    this.complexity = getsMergeComplexity(this.towersLength)
    await this.start()
    await this.mergeSort(this.towers, 0, this.towers.length-1)
    await this.finish()
  }

  async mergeSort(arr: TowerData[], left: number, right: number) {
    if (left >= right) return;
    const middle = Math.floor(left + (right - left)/2);
    await this.mergeSort(arr, left, middle);
    await this.mergeSort(arr, middle + 1, right);
    await this.merge(arr, left,  middle, right);
  }

  async merge(arr: TowerData[], left: number, middle: number, right: number) {

    for(let i = 0; i < arr.length; i++) {
      if(i < left || i > right) {
        arr[i].setAsUnsorted();
      } else {
        arr[i].setAsSelected();
      }
    }

    const leftArr: TowerData[] = arr.slice(left, middle + 1);
    const rightArr: TowerData[] = arr.slice(middle + 1, right + 1);

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
    this.complexity = getQuickComplexity(this.towersLength, useRandom);
    this.start();
    await this.quickSort(0, this.towersLength-1, this.towers, useRandom)
    this.finish();
  }

  async quickSort(indexL: number, indexR: number, arr: TowerData[], useRandom: boolean) {

    if (indexL < indexR) {
      const pivoIndex: number = useRandom 
        ? await this.partitionRandom(indexL, indexR, arr)
        : await this.partition(indexL, indexR, arr);
      await this.quickSort(indexL, pivoIndex - 1, arr, useRandom);
      await this.quickSort(pivoIndex + 1, indexR, arr, useRandom);
    }
  }
  async quickSortRandom(indexL: number, indexR: number, arr: TowerData[]) {

    if (indexL < indexR) {
      const pivoIndex: number = await this.partitionRandom(indexL, indexR, arr);
      await this.quickSortRandom(indexL, pivoIndex - 1, arr);
      await this.quickSortRandom(pivoIndex + 1, indexR, arr);
    }
  }

  async partitionRandom(indexL: number, indexR: number, arr: TowerData[]) {
    const i: number =   Math.floor(Math.random() * (indexR - indexL + 1)) + indexL;
    await Promise.all([
      arr[indexR].setAsMarked(),
      arr[i].setAsMarked()
    ])
    await Promise.all([
      arr[indexR].setPosition(i),
      arr[i].setPosition(indexR)
    ])
    const aux: TowerData = arr[indexR];
    arr[indexR] = await arr[i].clone();
    arr[i] = aux;
    await arr[i].setAsUnsorted();
    return this.partition(indexL, indexR, arr)
  }

  async partition(indexL: number, indexR: number, arr: TowerData[]): Promise<number> {
    let aux: TowerData;
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