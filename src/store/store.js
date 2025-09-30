import { create } from "zustand"




 const Store=create((set)=>({
  theme:'light',
  setTheme:(x)=>set({theme:x})
 }))

export default Store;