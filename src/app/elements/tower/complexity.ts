export interface Complexity {
  title: string | null;
  bestCount: number | null;
  averageCount: number | null;
  worstCount: number | null;
  bestFormula: string | null;
  averageFormula: string | null;
  worstFormula: string | null;
  bigO: string
}

export function getInsertComplexity(n: number): Complexity {
  // T(n) ≈ n (comparações, 0 movimentos)
  // T(n) ≈ n²/4 + n²/4 = n²/2 (comparações + movimentos)     
  // T(n) ≈ n²/2 + n²/2 = n² (comparações + movimentos)       
  // O(n) / O(n²)  
  return {
    title: "InsertSort",
    bestCount: n,
    averageCount: (n**2)/2,
    worstCount: n**2,
    bestFormula: 'T(n) ≈ n',
    averageFormula: 'T(n) ≈ n²/2',
    worstFormula: 'T(n) ≈ n²',
    bigO: 'O(n) / O(n²)'
  }
}

export function getSelectComplexity(n: number): Complexity {
  // T(n) ≈ n²/2 + n (comparações + trocas)              
  // T(n) ≈ n²/2 + n (comparações + trocas)
  // T(n) ≈ n²/2 + n (comparações + trocas)                   
  // O(n²)                     
  
  return {
    title: 'SelectSort',
    bestCount: (n**2)/2 + n,
    averageCount: (n**2)/2 + n,
    worstCount: (n**2)/2 + n,
    bestFormula: 'T(n) ≈ n²/2 + n',
    averageFormula: 'T(n) ≈ n²/2 + n',
    worstFormula: 'T(n) ≈ n²/2 + n',
    bigO: 'O(n²)'
  }
}

export function getsShellComplexity(n: number): Complexity {
  return {
    title: 'ShellSort',
    bestCount: Math.round(n * Math.log2(n)),
    averageCount: Math.round(1.2*Math.pow(n, 1.5)),
    worstCount: null,
    bestFormula: 'T(n) ≈ n log₂(n)',
    averageFormula: 'T(n) ≈ n^1.5',
    worstFormula: null,
    bigO: 'O(n log n) / O(n¹·⁵)'
  }
}

export function getsMergeComplexity(n: number): Complexity {
  const log2n = Math.log2(n);

  return {
    title: 'MergeSort',
    bestCount: null,
    averageCount: Math.round(n * log2n),
    worstCount: null,
    bestFormula: null,
    averageFormula: 'T(n) ≈ n log₂n',
    worstFormula: null,
    bigO: 'O(n log n)'
  };
}

export function getQuickComplexity(n: number, isRandom: boolean): Complexity {
  const log2n = Math.log2(n);
  const bestCount = Math.round(n * log2n);
  const averageCount = Math.round(n * log2n);
  const worstCount = Math.round((n ** 2) / 2);
  if(isRandom){
    return {
      title: "QuickSort",
      bestCount: null,
      averageCount,
      worstCount: null,
      bestFormula: null,
      averageFormula: 'T(n) ≈ n log₂(n)',
      worstFormula: null,
      bigO: 'O(n log n)'
    };
  }
  return {
    title: "QuickSort",
    bestCount,
    averageCount,
    worstCount,
    bestFormula: 'T(n) = n log₂(n)',
    averageFormula: 'T(n) ≈ n log₂(n)',
    worstFormula: 'T(n) = (n²)/2',
    bigO: 'O(n log n) / O(n²)'
  };
}