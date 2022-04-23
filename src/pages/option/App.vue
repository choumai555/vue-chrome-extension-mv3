<template>
  <div id="app">
    <h3>hello vue !</h3>
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