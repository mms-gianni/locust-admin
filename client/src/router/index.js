import VueRouter from "vue-router"
import Clusterlist from "@/components/cluster_list"
import Configlist from "@/components/config_list"
import Librarylist from "@/components/library_list"
import Libraryeditor from "@/components/library_editor"

export default new VueRouter({
  routes: [
    {
      path: "/",
      name: "Clusterlist",
      component: Clusterlist
    },
    {
      path: "/configlist",
      name: "Configlist",
      component: Configlist
    },
    {
      path: "/library",
      name: "Library",
      component: Librarylist
    },
    {
      path: "/libraryeditor",
      name: "Libraryeditor",
      component: Libraryeditor
    }
  ]
})