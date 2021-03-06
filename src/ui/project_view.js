import React from 'react'
import {Navigation} from './navigation_view'
import {ProjectSettings} from './project_settings'
import {SettingsList} from './settings_list'
import {AddArtwork} from './artwork'
import {Brief} from './brief'
import {app} from '../db/firebase'
import {Header} from '../container/header'
import {UsersCatalog} from '../container/users_catalog'
import {UsersCatalogMembers} from '../container/users_catalog_members'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {AddTask} from './add_task'
import propTypes from 'prop-types'

class ProjectView extends React.Component{
      constructor(props){
           super(props)
           this.state={admin:false,saved:false,project:null,filteredProject:null,selected:'first'}
           this.newTaskAdded=this.newTaskAdded.bind(this)
           this.artWorkAdded=this.artWorkAdded.bind(this)
           this.showAllTasks=this.showAllTasks.bind(this)
           this.filterTasks=this.filterTasks.bind(this)
           this.activateButton=this.activateButton.bind(this)
           this.activateButtonTasks=this.activateButtonTasks.bind(this)
           this.briefAdded=this.briefAdded.bind(this)
           this.stateChanged=this.stateChanged.bind(this)
           this.leaderAdded=this.leaderAdded.bind(this)
           this.memberAdded=this.memberAdded.bind(this)
           this.isAdmin=this.isAdmin.bind(this)
           this.changeState=this.changeState.bind(this)
      }
      isAdmin(){
          let self=this
          app.auth().currentUser.getIdTokenResult()
            .then((idTokenResult) => {
               if (idTokenResult.claims.admin) {
                 self.setState({admin:true})
               } else {
                 self.setState({admin:false})
               }
            })
            .catch((error) => {
              console.log(error)
            })
      }
      stateChanged(project){
           this.setState({project:project})
           this.props.editProject(project.createdBy,project.title,project.deadline,project.client,project.agency,project.description,project.id,project.leader,project.status,project.invoiced,project.invoice,project.tasks,project.brief,project.project_id,project.priority,project.members)
      }
      activateButton(name){
           return (name===this.state.selected) ? 'active-tasks-buttons tasks-list-buttons' : 'tasks-list-buttons'
      }
      filterTasks(value,rf){
           if(this.state.project.tasks){
           var newTasks=this.state.project.tasks.filter((task)=>task.completed===value)
           var newProjectState={...this.state.project}
           newProjectState.tasks=newTasks
           this.setState({filteredProject:newProjectState,selected:rf})
         }
           else{
                   return null
           }
      }
      showAllTasks(rf){
           this.setState({filteredProject:this.state.project,selected:rf})
      }
      leaderAdded(leaders){
           const newProjectState={...this.state.project,leader:leaders}
           this.stateChanged(newProjectState)
      }
      memberAdded(members){
           const newProjectState={...this.state.project,members:members}
           this.stateChanged(newProjectState)
      }
      briefAdded(newProjectState){
           this.stateChanged(newProjectState)
      }
      newTaskAdded(newProjectState){
           this.stateChanged(newProjectState)
      }
      artWorkAdded(newProjectState){
           this.stateChanged(newProjectState)
      }
      activateButtonTasks(id){
           if(this.state.project.tasks!==undefined){
           var [completedTasks]=this.state.project.tasks.filter(i=>i.id==id)

           if(completedTasks.completed){
               return "#5dea5d"
           }
           else{
               return "#dadada"
           }
         }
      }
      changeState(id){
           if(this.state.project.tasks!==undefined){
           var tasksCompleted=this.state.project.tasks.map(i=>{
             if(i.id==id){
                var taskCompleted={...i,completed:!i.completed}
                return taskCompleted
             }
             else{
                return i
             }
             }
           )
           this.stateChanged({...this.state.project,tasks:tasksCompleted})
         }
      }
      componentDidMount(){
           this.isAdmin()
           this.setState({project:{...this.props.location.state.project},
            filteredProject:{...this.props.location.state.project}
           })
      }
      render(){
      const {filteredProject, project } =  this.state
      const { newTaskAdded } = this
      return(
      <div className='JSX-container'>
      <Header/>
      <div className='page'>
      <Navigation/>
      <div className='page-content project-content dashboard-content'>
      {project ?
      <div className='project-container'>
      <div className='project-introduction'>
      <div className='project-title-container'>
      <h2> {project.title} </h2>
      </div>
      <div className='project-description'>
      {project.brief ?
        <a className='download-brief-files' href={project.brief} download> Download Brief</a>
        :
        <div><h3>Project description or </h3><Brief project={project} briefAdded={this.briefAdded}/></div>
      }
      <p> {project.description} </p>
      </div>
      </div>
      <div className='project-details'>
      <h2> Project Details </h2>
      <div className='project-details-rows'>
      <h3> Client: </h3>
      <h3><strong> {project.client} </strong></h3>
      </div>
      <div className='project-details-rows'>
      <h3>Created:</h3>
      <h3><strong>{project.date_started}</strong></h3>
      </div>
      <div className='project-details-rows'>
      <h3>Created By:</h3>
      <h3><strong>{project.createdBy.name}</strong></h3>
      </div>
      <div className='project-details-rows'>
      <h3>Deadline:</h3>
      <h3><strong>{new Date(project.deadline).toDateString()}</strong></h3>
      </div>
      <div className='project-details-rows'>
      <h3>Status:</h3>
      <h3>{project.status===0?
        <strong>In Progress</strong>
        :
        <strong>Completed</strong>
      }</h3>
      </div>
      <div className='project-details-rows'>
      <h3>Invoiced:</h3>
      <h3>{project.invoiced&&project.status ?
       <strong style={{color:'#30c960'}}>
        <FontAwesomeIcon
      icon="check-circle"
      color="#30c960"
/>{' '} {project.invoice} </strong> : <strong style={{color:'red'}}>Not Ready</strong>}
</h3>
      </div>
      </div>
      <div className='project-tasks-container'>
      <div>
      <div className='tasks-list-container'>
      {this.state.admin&&
      <AddTask project={project} newTaskAdded={newTaskAdded}/>
    }
      <div className='tasks-list-filters'>
      <div className={this.activateButton('first')} onClick={()=>this.showAllTasks('first')}>
      <h3>All Tasks</h3>
      </div>
      <div className={this.activateButton('second')} onClick={()=>this.filterTasks(false,'second')}>
      <h3>Pending Tasks</h3>
      </div>
      <div className={this.activateButton('third')} onClick={()=>this.filterTasks(true,'third')}>
      <h3>Completed Tasks</h3>
      </div>
      </div>
      {project.tasks!==undefined&&
        <div>
      {project.tasks===undefined&&
      <p> No tasks Added </p>
    }
      <ul>
      {filteredProject.tasks.map(i=>{
      return(
      <li><div className='tasks-action-btn' onClick={()=>this.changeState(i.id)}>
      <FontAwesomeIcon
    icon="check-circle"
    color={this.activateButtonTasks(i.id)}
/>{' '}</div><div className='tasks-name'>{i.name}</div>
      {this.state.admin&&
      <AddArtwork task={i} artWorkAdded={this.artWorkAdded} project={project}/>
    }
      </li>
      )
      })}
      </ul>
      </div>
    }
      </div>
      </div>
      </div>
      <div className='project-details'>
      <h2> Assigned Leader </h2>
      {project.leader!==undefined ?
      <div className='leaders-list'>
      {project.leader.map(i=>
      <div className='project-details-rows'>
      <h3>{i.name}</h3>
      </div>
       )
      }
      </div>
      :
      null
      }
      {this.state.admin&&project.leader!==undefined?
      <UsersCatalog leaderAdded={this.leaderAdded} leader={project.leader}/>
      :
      <UsersCatalog leaderAdded={this.leaderAdded} leader={[]}/>
    }
      </div>
      <div className='occupying-space'/>
      <div className='project-details'>
      <h2> Assigned Team </h2>
      {project.members!==undefined ?
      <div className='leaders-list'>
      {project.members.map(i=>
      <div className='project-details-rows'>
      <h3>{i.name}</h3>
      </div>
       )
      }
      </div>
      :
      null
      }
      {this.state.admin&&project.members!==undefined?
      <UsersCatalogMembers memberAdded={this.memberAdded} members={project.members}/>
      :
      <UsersCatalogMembers memberAdded={this.memberAdded} members={[]}/>
      }
      </div>
      </div>
      :
      <div className='loader'>
      </div>
      }
      </div>
      </div>
      </div>
    )
  }
}
export {ProjectView}
