<script setup>
import { ref, onMounted } from 'vue';
import { RouterLink, RouterView } from 'vue-router';
import 'animate.css';
import Icon from "@/components/Icon.vue";

const fileInput = ref(null);
const filename = ref('');
const isUploaded = ref(false);
const url = '/upload';

const handleFileChange = (event) => {
  isUploaded.value = false;
  const file = event.target.files[0];
  if (file) {
    filename.value = file.name;
    isUploaded.value = true;
  }
};

const sendFile = async () => {
  if (!fileInput.value.files.length) {
    alert('Bitte wählen Sie ein Bild aus.');
    return;
  }

  const formData = new FormData();
  formData.append('imageData', fileInput.value.files[0]);

  const response = await fetch(url, {
    method: 'POST',
    body: formData
  });

  if (response.ok) {
    window.location.href = '/success';
  }
};
</script>

<template>
  <div class="w-screen h-screen bg-gray-100 p-2 flex flex-col justify-between items-center dark:bg-gray-900">
    <div class="w-full h-full flex flex-col justify-center items-center">
      <RouterView />
    </div>
  </div>
</template>

<style scoped>
</style>
