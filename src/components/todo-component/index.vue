<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12" md="8">
        <v-container>
          <v-row>
            <v-col cols="12">
              <h1 class="text-h4 mb-4">Мои задачи</h1>
              <todo-component-filter/>
              <todo-component-add />

              <div v-if="!state.showActivity">
                <todo-component-list />
              </div>

              <div v-else>
                <todo-component-activity v-if="state.showActivity" />
              </div>

              <v-btn 
                @click="toggleActivityView" 
                color="primary" 
                class="mt-2 mb-4"
                :prepend-icon="state.showActivity ? 'mdi-history' : 'mdi-chart-bar'"
              >
                {{ state.text }}
              </v-btn>

              <todo-component-statistics />
            </v-col>
          </v-row>
        </v-container>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { useTasksStore } from '@/store/tasks'
import { onMounted, reactive } from 'vue'

const tasksStore = useTasksStore()
const { fetchTasks } = tasksStore

const state = reactive({
  text: 'Показать задачи',
  showActivity: false
})

function toggleActivityView() {
  state.showActivity = !state.showActivity
  state.text = state.showActivity ? 'Показать задачи' : 'Показать активноость'
}

onMounted(() => {
  fetchTasks()
})
</script>