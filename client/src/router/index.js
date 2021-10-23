import VueRouter from "vue-router"
import Clusterlist from "@/components/cluster_list"
import Configlist from "@/components/config_list"
import Library from "@/components/library"

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
      component: Library
    }
  ]
})