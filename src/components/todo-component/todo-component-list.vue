<template>
  <v-list lines="two" class="elevation-1 rounded">
    <v-list-item v-for="task in filteredTasks" :key="task.id">
      <template v-slot:prepend>
        <v-checkbox
          :model-value="task.completed"
          @update:model-value="toggleTaskCompletion(task.id)"
          density="comfortable"
        />
      </template>
      
      <v-list-item-title 
        :class="{ 'text-decoration-line-through text-grey': task.completed }"
        class="font-weight-medium"
      >
        {{ task.title }}
      </v-list-item-title>
      <v-list-item-subtitle>
        Создано: {{ formatDate(task.createdAt) }}
        | Обновлено: {{ formatDate(task.updatedAt) }}
        <span v-if="task.completed">
          | Завершено: {{ formatDate(task.completedAt) }}
        </span>
      </v-list-item-subtitle>
      
      <template v-slot:append>
        <div v-if="pendingDeletions.has(task.id)" class="deletion-pending">
          <v-chip color="error" size="small" class="mr-2">
            Удаление через {{ deletionTimers[task.id]?.timeLeft || 10 }}
          </v-chip>
          <v-btn 
            @click="cancelDeletion(task.id)"
            variant="text"
            color="warning"
            size="small"
          >
            Отмена
          </v-btn>
        </div>
        <v-btn 
          v-else
          icon 
          @click="startDeletion(task.id)"
          variant="text"
          color="error"
          size="small"
        >
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </template>
    </v-list-item>
    
    <v-list-item v-if="filteredTasks.length === 0">
      <v-list-item-title class="text-center text-grey pa-8">
        <v-icon size="48" class="mb-3" color="grey-lighten-1">mdi-playlist-remove</v-icon><br>
        <span class="text-h6">Нет задач</span><br>
        <span class="text-body-2">Создайте первую задачу или измените фильтр</span>
      </v-list-item-title>
    </v-list-item>
  </v-list>
</template>

<script setup lang="ts">
import { useFiltersStore } from '@/store/filters'
import { useTasksStore } from '@/store/tasks'
import { formatDate } from '@/utils/formatDate'
import { storeToRefs } from 'pinia'
import { computed, onUnmounted, ref } from 'vue'

type DeletionTimer = {
  timerId: number
  timeLeft: number
}


const tasksStore = useTasksStore()
const { deleteTask, toggleTaskCompletion } = tasksStore
const { tasksSortedByCreatedAt } = storeToRefs(tasksStore)

const filtersStore = useFiltersStore()
const { currentFilter } = storeToRefs(filtersStore)

const pendingDeletions = ref<Set<number>>(new Set())
const deletionTimers = ref<Record<number, DeletionTimer>>({})


const filteredTasks = computed(() => {
  switch (currentFilter.value) {
    case 'active':
      return tasksSortedByCreatedAt.value.filter(t => !t.completed)
    case 'completed':
      return tasksSortedByCreatedAt.value.filter(t => t.completed)
    default:
      return tasksSortedByCreatedAt.value
  }
})

const startDeletion = (id: number) => {
  if (pendingDeletions.value.has(id)) return

  pendingDeletions.value.add(id)

  const timerId = window.setInterval(() => {
    const timer = deletionTimers.value[id]
    if (!timer) return

    timer.timeLeft--

    if (timer.timeLeft <= 0) {
      deleteTask(id)
      pendingDeletions.value.delete(id)
      clearInterval(timerId)
      delete deletionTimers.value[id]
    }
  }, 1000)

  deletionTimers.value[id] = {
    timerId,
    timeLeft: 10
  }
}

const cancelDeletion = (id: number) => {
  pendingDeletions.value.delete(id)
  
  const timer = deletionTimers.value[id]
  if (timer) {
    clearInterval(timer.timerId)
    delete deletionTimers.value[id]
  }
}

onUnmounted(() => {
  Object.values(deletionTimers.value).forEach(timer => {
    clearInterval(timer.timerId)
  })
})
</script>

<style scoped>
.deletion-pending {
  display: flex;
  align-items: center;
}

.text-decoration-line-through {
  text-decoration: line-through;
}
</style>
