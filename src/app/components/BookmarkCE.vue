<script lang="ts" setup>
  import Frame from './partials/Frame.vue';

  defineProps({ uuid: { type: String, required: true } });

  // Add font
  const linkNode = document.createElement('link');
  linkNode.type = 'text/css';
  linkNode.rel = 'stylesheet';
  linkNode.href =
    'https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap';
  document.head.appendChild(linkNode);
</script>

<template>
  <Frame :uuid="uuid"></Frame>
</template>
