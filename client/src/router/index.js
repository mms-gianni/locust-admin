import VueRouter from "vue-router"
import Clusterlist from "@/components/cluster_list"
import Configlist from "@/components/config_list"

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
    }
  ]
})