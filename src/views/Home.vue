<template>
  <v-header/>
  <v-sidebar/>
  <div class="content-box" :class="{ 'content-collapse': sidebar.collapse }">
    <v-tags/>
    <div class="content">
      <router-view v-slot="{ Component }">
        <transition name="move" mode="out-in">
          <keep-alive :include="tags.nameList">
            <component :is="Component"></component>
          </keep-alive>
        </transition>
      </router-view>
    </div>
  </div>
</template>
<script setup lang="ts">
import {useSidebarStore} from '../store/SideBar';
import {useTagsStore} from '../store/Tags';
import VHeader from '../components/Header.vue';
import VSidebar from '../components/Sidebar.vue';
import VTags from '../components/Tags.vue';

const sidebar = useSidebarStore();

const tags = useTagsStore();
</script>
