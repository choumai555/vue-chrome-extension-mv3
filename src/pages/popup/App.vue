<template>
  <div class="chrome_container">
    <ElInput v-model="msg"></ElInput>
  </div>
</template>
<script setup lang="ts">
import { ref } from "vue";
const msg = ref("");
</script>
<style  lang='less' scoped>
@import "@/style/main.css";
.chrome_container {
  width: 300px;
  background-color: white;
}
</style>