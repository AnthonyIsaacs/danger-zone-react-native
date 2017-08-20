import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { Constants, Location, MapView, Permissions } from 'expo';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.updateRegion = this.updateRegion.bind(this);
    this.handleUpdateLocation = this.handleUpdateLocation.bind(this);
    this.state = {
      region: {
        latitude: 39.1,
        longitude: -84.51,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      },
      errorMessage: null,
      fireDangers: [],
      foodDangers: [],
      busDangers: [],
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
    fetch(`http://hackcincydangerzone.azurewebsites.net/?latitude=${this.state.region.latitude}&longitude=${this.state.region.longitude}&searchList=Fire&searchList=Food&searchList=Bus`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    })
    .then((response) => response.json())
    .then((responseJson) => {
      console.log('response: ', responseJson);
      this.setState(prevState => ({
        ...prevState,
        fireDangers: responseJson.Fire || [],
        foodDangers: responseJson.Food || [],
        busDangers: responseJson.Bus.buses || [],
      }));
    })
    .catch((error) => {
      console.error(error);
    });
  }

  render() {
    console.log('dangers: ', this.state.fireDangers, this.state.foodDangers, this.state.busDangers);
    return (
      <MapView
        style={ { flex: 1 } }
        region={ this.state.region }
      >
        {this.state.foodDangers.map((danger, index) => (
            <MapView.Marker
              key={ `food-${index}` }
              coordinate={ {
                latitude: parseFloat(danger.Latitude),
                longitude: parseFloat(danger.Longitude),
              } }
              title={ danger.business_name }
              description={ danger.violation_comments || 'You\'re safe!' }
            />
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
            />
          )
        )}
        {this.state.busDangers.map((danger, index) => (
            <MapView.Marker
              key={ `bus-${index}` }
              coordinate={ {
                latitude: parseFloat(danger.latitude),
                longitude: parseFloat(danger.longitude),
              } }
              title={ danger.id ? `Bus #${danger.id}` : 'No buses here!' }
              description={ danger.id ? 'You may be run over in this area!' : 'You\'re safe!' }
            />
          )
        )}
      </MapView>
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
