<script setup>
import { ref } from 'vue'

defineProps({
  msg: String,
})

const count = ref(0)
</script>

<template class="b2">
  <h1>{{ msg }}</h1>

  <div class="b2 card">
    <button type="button" @click="count++">count is {{ count }}</button>
  </div>
</template>

<style>
.read-the-docs {
  color: #888;
}
.b2 {
  background-color: red;
  background: red;
  color: red;
}
</style>
