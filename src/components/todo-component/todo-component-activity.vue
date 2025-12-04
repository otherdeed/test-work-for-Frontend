<template>
  <v-card class="elevation-2 rounded">

    <v-card-text class="pa-0">
      <v-list lines="two">
        <v-list-item 
          v-for="activity in activities" 
          :key="activity.id"
        >
          <template v-slot:prepend>
            <v-icon :icon="getActivityIcon(activity.action)" size="20"></v-icon>
          </template>
          
          <v-list-item-title class="font-weight-medium">
            {{ getActivityText(activity.action) }}
            <span class="task-title">"{{ activity.taskTitle }}"</span>
          </v-list-item-title>
          
          <v-list-item-subtitle>
            <v-icon icon="mdi-clock-outline" size="14" class="mr-1"></v-icon>
            {{ formatDate(activity.timestamp) }}
          </v-list-item-subtitle>
        </v-list-item>
        
        <v-list-item v-if="activities.length === 0">
          <v-list-item-title class="text-center text-grey">
            Активности пока нет
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { useTasksStore } from '@/store/tasks'
import { formatDate } from '@/utils/formatDate'
import { computed } from 'vue'
import type { Activity } from '@/types'

const tasksStore = useTasksStore()
const activities = computed(() => tasksStore.activitiesSorted)

function getActivityText(action: Activity['action']): string {
  const actions: Record<Activity['action'], string> = {
    added: 'Добавлена задача',
    deleted: 'Удалена задача',
    completed: 'Выполнена задача',
    uncompleted: 'Задача возвращена в работу'
  }
  return actions[action]
}

function getActivityIcon(action: Activity['action']): string {
  const icons: Record<Activity['action'], string> = {
    added: 'mdi-plus-circle',
    deleted: 'mdi-delete-circle',
    completed: 'mdi-check-circle',
    uncompleted: 'mdi-restore'
  }
  return icons[action]
}
</script>

<style scoped>

.task-title {
  color: #1976d2;
  font-weight: 500;
  margin-left: 4px;
}
</style>