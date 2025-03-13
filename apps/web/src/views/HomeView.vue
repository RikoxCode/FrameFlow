<script setup>
import Icon from "@/components/Icon.vue";
import { ref, onMounted } from 'vue';
import { RouterLink, RouterView } from 'vue-router';
import 'animate.css';

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
    <div class="bg-white p-8 rounded-lg shadow-lg w-full max-w-md dark:bg-gray-800">
      <h1 class="text-2xl font-semibold text-center text-gray-800 mb-6 dark:text-slate-200">Lade ein Bild hoch</h1>

      <form @submit.prevent="sendFile" enctype="multipart/form-data" class="space-y-4">
        <!-- File Input -->
        <div class="w-full py-9 bg-gray-50 rounded-2xl border border-gray-300 gap-3 grid border-dashed relative dark:bg-gray-600 dark:border-gray-700">
          <label>
            <div class="grid gap-1">
              <Icon v-if="isUploaded" icon="description" class="text-4xl text-gray-400 text-center animate__animated animate__fadeInUp animate__faster"/>
              <h2 v-if="!isUploaded" class="text-center text-gray-400 text-xs leading-4 mb-4">PNG, JPG oder PDF, kleiner als 15MB</h2>
            </div>
            <div class="grid gap-2">
              <p :class="{'animate__animated animate__fadeIn': isUploaded, 'hidden':!isUploaded}" id="filename" class="my-2 text-center text-gray-400 text-md leading-4">{{ filename }}</p>
              <div class="flex items-center justify-center">
                <input ref="fileInput" type="file" name="imageData" hidden @change="handleFileChange"/>
                <div class="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded-full text-sm cursor-pointer">
                  {{ isUploaded ? 'Datei wechseln' : 'Datei auswählen' }}
                </div>
              </div>
            </div>
          </label>
        </div>
        <!-- Submit Button -->
        <button type="submit" class="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center gap-2">
          <p>Hochladen</p>
        </button>
        <div class="flex justify-center">
          <p class="text-md font-semibold text-center text-gray-800 mb-6 dark:text-gray-400">Hier lang zur <a class="text-blue-500 hover:underline" href="/info">Info Seite</a></p>
        </div>
      </form>
    </div>
</template>

<style scoped>

</style>
