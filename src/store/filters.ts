import { defineStore } from "pinia";
import { ref } from "vue";

export const useFiltersStore = defineStore('filters', () => {
  const currentFilter = ref<'all' | 'active' | 'completed'>('all')

  function setCurrentFilter(filter: 'all' | 'active' | 'completed') {
    currentFilter.value = filter
  }

  return {
    //state
    currentFilter,
    
    //actions
    setCurrentFilter
  }
})