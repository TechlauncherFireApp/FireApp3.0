import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

import NavBar from './components/Navbar/navbar';
import AssetRequestVehicle from './routes/AssetRequestVehicle/AssetRequestVehicle';
import AssetRequestVolunteers from './routes/AssetRequestVolunteers/assetRequestVolunteers';
import AssetTypeRoles from './routes/AssetTypeRoles';
import Login from './routes/Authentication/login';
import Logout from './routes/Authentication/logout';
import Register from './routes/Authentication/register';
import BrigadeCaptainHome from './routes/BrigadeCaptainHome/brigadeCaptainHome';
import Home from './routes/Home/Home';
import AssetTypes from './routes/Reference/assetTypes';
import Qualifications from './routes/Reference/qualifications';
import Roles from './routes/Reference/roles';
import UserPrivileges from './routes/UserPrivileges';
import VolunteerRoles from './routes/VolunteerRoles';
import Availability from './routes/Volunteers/Availability/Availability';
import Volunteer from './routes/Volunteers/volunteer';
import VolunteersContainer from './routes/Volunteers/volunteersContainer';

export default function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <div className={'main-body'}>
        <Switch>
          <Route exact path="/" component={Home}>
            <Home/>
          </Route>

          <Route exact path="/login" component={Login}>
            <Login/>
          </Route>

          <Route exact path="/logout" component={Logout}>
            <Logout/>
          </Route>

          <Route exact path="/register" component={Register}>
            <Register/>
          </Route>

          <Route exact path="/reference/roles" component={Roles}>
            <Roles/>
          </Route>

          <Route exact path="/reference/qualifications" component={Qualifications}>
            <Qualifications/>
          </Route>

          <Route exact path="/reference/asset_types" component={AssetTypes}>
            <AssetTypes/>
          </Route>

          <Route exact path="/captain" component={BrigadeCaptainHome}>
            <BrigadeCaptainHome/>
          </Route>

          <Route exact path="/assetRequest/vehicles/:id" component={AssetRequestVehicle}>
            <AssetRequestVehicle/>
          </Route>

          <Route exact path="/assetRequest/volunteers/:id" component={AssetRequestVolunteers}>
            <AssetRequestVolunteers/>
          </Route>

          <Route exact path="/volunteer" component={VolunteersContainer}>
            <VolunteersContainer/>
          </Route>

          <Route exact path="/volunteer-roles" component={VolunteerRoles}>
            <VolunteerRoles/>
          </Route>

          <Route exact path="/asset-type-roles" component={AssetTypeRoles}>
            <AssetTypeRoles/>
          </Route>

          <Route exact path="/user-privileges" component={UserPrivileges}>
            <UserPrivileges/>
          </Route>

          <Route exact path="/volunteer/:id" component={Volunteer}>
            <Volunteer/>
          </Route>

          <Route exact path="/volunteer/:id/availability" component={Availability}>
            <Availability/>
          </Route>
        </Switch>
      </div>
    </BrowserRouter>
  );
}
