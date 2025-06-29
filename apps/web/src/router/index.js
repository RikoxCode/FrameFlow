import { createRouter, createWebHistory } from 'vue-router'
import HomeView from "@/views/HomeView.vue";
import ShowcaseView from "@/views/ShowcaseView.vue";
import Success from "@/views/Success.vue";
import InfoView from "@/views/InfoView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: HomeView
    },
    {
      path: '/showcase',
      component: ShowcaseView
    },
    {
      path: '/success',
      component: Success
    },
    {
      path: '/info',
      component: InfoView
    }
  ],
})

export default router
