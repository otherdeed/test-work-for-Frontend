<template>
  <v-card class="mt-6">
    <v-card-text>
      <p>Всего задач: {{ tasksSortedByCreatedAt.length }}</p>
      <p>Активных: {{ tasksSortedByCreatedAt.filter(t => !t.completed).length }}</p>
      <p>Завершенных: {{ tasksSortedByCreatedAt.filter(t => t.completed).length }}</p>
      <p>Процент завершения: 
        {{ tasksSortedByCreatedAt.filter(t => t.completed).length / (tasksSortedByCreatedAt.length || 1) * 100 }}%
      </p>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { useTasksStore } from '@/store/tasks';
import { storeToRefs } from 'pinia';

const tasksStore = useTasksStore()
const { tasksSortedByCreatedAt } = storeToRefs(tasksStore)
</script>