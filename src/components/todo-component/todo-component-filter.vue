<template>
  <div class="filter-section mb-4">
    <v-btn 
      @click="setCurrentFilter('all')"
      :class="{ 'bg-primary': currentFilter === 'all' }"
      variant="tonal"
      class="mr-2"
    >
      Все ({{ tasks.length }})
    </v-btn>
    <v-btn 
      @click="setCurrentFilter('active')"
      :class="{ 'bg-primary': currentFilter === 'active' }"
      variant="tonal"
      class="mr-2"
    >
      Активные ({{ tasks.filter(t => !t.completed).length }})
    </v-btn>
    <v-btn 
      @click="setCurrentFilter('completed')"
      :class="{ 'bg-primary': currentFilter === 'completed' }"
      variant="tonal"
      class="mr-2"
    >
      Завершенные ({{ tasks.filter(t => t.completed).length }})
    </v-btn>
  </div>
</template>

<script setup lang="ts">
import { useFiltersStore } from '@/store/filters';
import { useTasksStore } from '@/store/tasks';
import { storeToRefs } from 'pinia';

const filtersStore = useFiltersStore()
const { setCurrentFilter } = filtersStore
const { currentFilter } = storeToRefs(filtersStore)


const tasksStore = useTasksStore()
const { tasks } = storeToRefs(tasksStore)
</script>

<style scoped>
.filter-section {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

@media (max-width: 960px) {
  .filter-section {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .filter-section button {
    width: 100%;
    margin-bottom: 8px;
  }
}
</style>