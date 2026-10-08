<template>
  <svg
    class="so-icon"
    width="100%"
    height="100%"
    :viewBox="viewBox"
    preserveAspectRatio="xMidYMid meet"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    focusable="false">
    <path :d="d" fill-rule="evenodd" fill="currentColor" />
  </svg>
</template>

<script setup>
/* 尺寸交给 CSS（.icn 槽的 --rail-slot / --rail-icon-h），
   这样缩放与手机端差异都只改 CSS 变量，不用动 JS。 */
defineProps({
  d: { type: String, required: true },
  viewBox: { type: String, default: '0 0 41 50' },
});
</script>
