import React from 'react';
import { Image, Platform, StyleSheet, Text, View } from 'react-native';
import { Constants, Location, MapView, Permissions } from 'expo';
import { Ionicons } from '@expo/vector-icons';
import { getGoogleMapStyle } from './google-map-style';
import { getDangerColor } from './getDangerColor';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.updateRegion = this.updateRegion.bind(this);
    this.handleUpdateLocation = this.handleUpdateLocation.bind(this);
    this.state = {
      region: {
        latitude: 39.1,
        longitude: -84.51,
        latitudeDelta: 0.035,
        longitudeDelta: 0.020,
      },
      errorMessage: null,
      fireDangers: [],
      foodDangers: [],
      busDangers: [],
      dangerLevel: 0,
    }
  }

  componentWillMount() {
    if (Platform.OS === 'android' && !Constants.isDevice) {
      this.setState({
        errorMessage: 'Oops, this will not work on Sketch in an Android emulator. Try it on your device!',
      });
    } else {
      this._getLocationAsync();
    }
  }

  _getLocationAsync = async () => {
    console.log("trying to get location");
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    console.log("got permissions");
    if (status !== 'granted') {
      this.setState({
        errorMessage: 'Permission to access location was denied',
      });
    }

    const location = await Location.getCurrentPositionAsync({});
    this.handleUpdateLocation(location);

    const removePositionSub = await Location.watchPositionAsync(
      { timeInterval: 400, distanceInterval: 1 },
      this.handleUpdateLocation
    )
  };

  handleUpdateLocation({coords}) {
    this.updateRegion(coords);
    this.requestDangers(coords);
  }

  updateRegion(coords) {
    this.setState(prevState => ({
      ...prevState,
      region: {
        ...prevState.region,
        latitude: coords.latitude,
        longitude: coords.longitude,
      },
    }));
  }

  requestDangers(coords) {
    // fetch(`http://hackcincydangerzone.azurewebsites.net/?latitude=${this.state.region.latitude}&longitude=${this.state.region.longitude}`, {
    fetch(`http://vpn.jmchn.net:5080/cincy/Food?latitude=${this.state.region.latitude}&longitude=${this.state.region.longitude}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    })
    .then((response) => {
      let responseJson;
      try {
        responseJson = response.json()
      }
      catch(e) {
        console.log('catching error', e);
        console.log('inside food parse catch');
        responseJson = {};
      }
      return responseJson;
    })
    .then((responseJson) => {
      console.log('response: ', responseJson);
      this.setState(prevState => ({
        ...prevState,
        foodDangers: (responseJson && responseJson.Food) || [],
        dangerLevel: (responseJson && Math.max(responseJson.danger, this.state.dangerLevel)) || this.state.dangerLevel,
      }));
    })
    .catch((error) => {
      console.error('Inside promise catch for Food');
      console.error(error);
    });
    fetch(`http://vpn.jmchn.net:5080/cincy/Fire?latitude=${this.state.region.latitude}&longitude=${this.state.region.longitude}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    })
    .then((response) => {
      let responseJson;
      try {
        responseJson = response.json()
      }
      catch(e) {
        console.log('catching error', e);
        responseJson = {};
      }
      return responseJson;
    })
    .then((responseJson) => {
      console.log('response: ', responseJson);
      this.setState(prevState => ({
        ...prevState,
        fireDangers: (responseJson && responseJson.Fire) || [],
        dangerLevel: (responseJson && Math.max(responseJson.danger, this.state.dangerLevel)) || this.state.dangerLevel
      }));
    })
    .catch((error) => {
      console.error('Inside promise catch for Fire');
      console.error(error);
    });
    fetch(`http://vpn.jmchn.net:5080/bus?latitude=${this.state.region.latitude}&longitude=${this.state.region.longitude}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      })
    .then((response) => {
      let responseJson;
      try {
        responseJson = response.json()
      }
      catch(e) {
        console.log('catching error', e);
        responseJson = {};
      }
      return responseJson;
    })
    .then((responseJson) => {
      console.log('response: ', responseJson);
      this.setState(prevState => ({
        ...prevState,
        busDangers: (responseJson && responseJson.buses) || [],
        dangerLevel: (responseJson && Math.max(responseJson.danger, this.state.dangerLevel)) || this.state.dangerLevel,
      }));
    })
    .catch((error) => {
      console.error('Inside promise catch for buses');
      console.error(error);
    });
    fetch(`http://vpn.jmchn.net:5080/asteroid?latitude=${this.state.region.latitude}&longitude=${this.state.region.longitude}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      })
    .then((response) => {
      let responseJson;
      try {
        responseJson = response.json()
      }
      catch(e) {
        console.log('catching error', e);
        responseJson = {};
      }
      return responseJson;
    })
    .then((responseJson) => {
      console.log('response: ', responseJson);
      this.setState(prevState => ({
        ...prevState,
        dangerLevel: (responseJson && Math.max(responseJson.danger, this.state.dangerLevel)) || this.state.dangerLevel,
      }));
    })
    .catch((error) => {
      console.error('Inside promise catch for buses');
      console.error(error);
    });
    fetch(`http://vpn.jmchn.net:5080/weather?latitude=${this.state.region.latitude}&longitude=${this.state.region.longitude}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      })
    .then((response) => {
      let responseJson;
      try {
        responseJson = response.json()
      }
      catch(e) {
        console.log('catching error', e);
        responseJson = {};
      }
      return responseJson;
    })
    .then((responseJson) => {
      console.log('response: ', responseJson);
      this.setState(prevState => ({
        ...prevState,
        dangerLevel: (responseJson && Math.max(responseJson.danger, this.state.dangerLevel)) || this.state.dangerLevel,
      }));
    })
    .catch((error) => {
      console.error('Inside promise catch for buses');
      console.error(error);
    });
  }

  render() {
    console.log('fires: ', this.state.fireDangers.map(fire => fire.longitude));
    return (
      // <View>
        // {/* <Image source={require('./Logo_small_transparent.png')} /> */}
        <MapView
          style={ { flex: 1 } }
          region={ this.state.region }
          customMapStyle={ getGoogleMapStyle() }
          provider={MapView.PROVIDER_GOOGLE}
        >
          {this.state.foodDangers.map((danger, index) => (
              <MapView.Marker
                key={ `food-${index}` }
                coordinate={ {
                  latitude: parseFloat(danger.Latitude),
                  longitude: parseFloat(danger.Longitude),
                } }
                title={ danger.violation_comments ? 'That\'s not looking fresh' : 'Enjoy your meal, here!' }
                description={ danger.violation_comments || 'You\'re safe!' }
              >
                <Ionicons name="md-pizza" size={32} style={{color: '#BD6F13'}} />
              </MapView.Marker>
            )
          )}
          {this.state.fireDangers.map((danger, index) => (
              <MapView.Marker
                key={ `fire-${index}` }
                coordinate={ {
                  latitude: parseFloat(danger.latitude_x),
                  longitude: parseFloat(danger.longitude_x),
                } }
                title={ danger.neighborhood }
                description={ danger.incident_type_desc || 'You\'re safe!' }
              >
                <Ionicons name="md-flame" size={32} color="#ff8000" />
              </MapView.Marker>
            )
          )}
          {this.state.busDangers.map((danger, index) => (
              <MapView.Marker
                key={ `bus-${index}` }
                coordinate={ {
                  latitude: danger.latitude,
                  longitude: danger.longitude,
                } }
                title={ danger.id ? `Bus #${danger.id}` : 'No buses here!' }
                description={ danger.id ? 'You may be run over in this area!' : 'You\'re safe!' }
              >
                <Ionicons name="md-bus" size={32} color="black" />
                {/* <MapView.Callout>
                  <MyCustomCalloutView {...marker} />
                </MapView.Callout> */}
              </MapView.Marker>
            )
          )}
          <MapView.Marker
            coordinate={ {
              latitude: this.state.region.latitude,
              longitude: this.state.region.longitude,
            } }
          >
            <Ionicons
              name="ios-body"
              size={40}
              style={{
                // borderColor: '#8E477E',
                // borderRadius: 100,
                // borderWidth: 20,
                color: getDangerColor(this.state.dangerLevel)
              }}
            />
            {/* <MapView.Callout>
              <MyCustomCalloutView {...marker} />
            </MapView.Callout> */}
          </MapView.Marker>
        </MapView>
      // </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
