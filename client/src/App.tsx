import React, { useEffect, useState } from 'react'

// React routing
import {
  BrowserRouter as Router,
  Switch,
  Route,
  useLocation,
} from 'react-router-dom'

// Local components
import Drawer from "./Components/Drawer"
import Reports from "./Components/Reports"
import Buildings from "./Components/Buildings"
import Assets from "./Components/Assets"
import Rooms from "./Components/Rooms"
import BuildingAssets from './Components/Buildings/Assets'
import DamageTypes from './Components/DamageTypes'

// Icons
import BusinessIcon from '@material-ui/icons/Business';
import ListIcon from '@material-ui/icons/List';
import CategoryIcon from '@material-ui/icons/Category';

export interface Page {
  title: string,
  path: string,
  icon: JSX.Element,
}

/**
 * Split up the sections of the application into arrays of arrays because 
 * it allows us to seperate sections via <Divider/> in the drawer
 */
const sections: Page[][] = [
  [
    {
      title: "All Fault Reports",
      path: "/reports",
      icon: <ListIcon />
    },
  ],
  [
    {
      title: "All Buildings",
      path: "/buildings",
      icon: <BusinessIcon />
    },
    {
      title: "All Assets",
      path: "/assets",
      icon: <ListIcon />
    },
    {
      title: "Damage Types",
      path: "/damage",
      icon: <CategoryIcon />
    }
  ]
]

/** 
 * Broken off from App() as we need a component downstream from the <Router/> to utilize hooks 
 */
const AppDrawer = () => {
  const location = useLocation();
  const [title, setTitle] = useState(sections[0][0].title)

  useEffect(() => {
    sections.forEach(section => {
      section.forEach(page => {
        if (page.path === location.pathname) {
          setTitle(page.title);
        }
      })
    })
  }, [location])

  return (
    <Drawer title={title} sections={sections}>
      <Switch>
        <Route path="/reports">
          <Reports />
        </Route>
        <Route exact path="/buildings">
          <Buildings />
        </Route>
        <Route exact path="/assets">
          <Assets />
        </Route>
        <Route exact path="/damage">
          <DamageTypes />
        </Route>
        <Route exact path="/building/:buildingId" render={(props) => (
          <Rooms buildingId={props.match.params.buildingId} />
        )} />
        <Route exact path="/building/:buildingId/room/:roomId" render={(props) => (
          <BuildingAssets buildingId={props.match.params.buildingId} roomId={props.match.params.roomId} />
        )} />
      </Switch>
    </Drawer>
  )
}

const App = () => {
  return (
    <Router>
      <AppDrawer />
    </Router>
  )
}

export default App
