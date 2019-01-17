import * as firebase from 'firebase'
import { FirebaseConfig } from "./config/keys"

export const app=firebase.initializeApp(FirebaseConfig)

export const databaseRef = firebase.database()
export const refProjects = databaseRef.ref("projects")
export const refUsers = databaseRef.ref("users")
export const refAdmin = databaseRef.ref("admin")
export const refApplications = databaseRef.ref("applications")
export var messaging
if(typeof firebase.messaging === "function"){
  messaging = firebase.messaging()
  messaging.usePublicVapidKey("BMBmefftt4bLhPyG98upi60BHB5lHJXgAVFheDgZqrIQ0qgbPjjSn29j3MrkZ-ulglJuuPlu_BPH8icx8qIBN8o")
}

let fetching=false;

export const writeUserData=(userId, name, email, imageUrl)=>{
  const newUser = refUsers.push()
  newUser.set({
      username: name,
      email: email,
      joined:new Date(),
      profile_picture : imageUrl,
      id: userId
    }
    )
}
export const deleteUser=(userId)=>{
   app.database().ref('users/'+userId).delete()
}
export const addProjecttoDb = ( project )=>{
       const newProject=refProjects.child(project.id)
       newProject.set(project)
}
export const fromStore = (state, db) => {
       if(!fetching){
       const users=Object.assign({},state.users)
       refUsers.set(users)
     }
}

const fromDb = (db, dispatch) => {
  fetching=true;
  refProjects.on('value', data => {
    if (data.val()) {
      const newState=Object.assign([],data.val())
      dispatch({ type:'CHANGE_STATE', payload: {state:newState}  })
    }
  })
  refUsers.on('value', data => {
    if (data.val()) {
      const newState=Object.assign([],data.val())
      dispatch({ type:'CHANGE_STATE_USERS', payload: {state:newState}  })
    }
  })
  fetching=false;
}
export const linkStoreWithDb = (fromDb, fromStore) => {
    return ((db, store) => {
      fromDb(db, store.dispatch)
      store.subscribe(() => fromStore(store.getState(), db))
    }
    )
}

export const linkMessage = linkStoreWithDb(fromDb, fromStore)
