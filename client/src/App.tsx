import React, { useEffect, useState } from 'react'

// React routing
import {
  BrowserRouter as Router,
  Switch,
  Route,
  useLocation
} from 'react-router-dom'

// Local components
import Drawer from "./Components/Drawer"
import Reports from "./Components/Reports"
import Buildings from "./Components/Buildings"

// Icons
import ViewListIcon from '@material-ui/icons/ViewList';
import BusinessIcon from '@material-ui/icons/Business';
// import PeopleIcon from '@material-ui/icons/People';

export interface Page {
  title: string,
  path: string,
  component: JSX.Element,
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
      component: <Reports />,
      icon: <ViewListIcon />,
    },
  ],
  [
    {
      title: "Buildings",
      path: "/buildings",
      component: <Buildings />,
      icon: <BusinessIcon />
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
        {sections.map(section =>
          section.map((page, index) => (
            <Route path={page.path} key={`page-${index}`}>
              {page.component}
            </Route>
          ))
        )}
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
