import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { REACT_APP_BACKEND } from 'react-native-dotenv';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { EmojiSadIcon } from 'react-native-heroicons/outline';
import { LinearGradient } from 'expo-linear-gradient';
import { Context, setImagesAction } from '../Context.jsx';
import Colors from '../utils/colors.js';
import OverlayOneImage from '../components/OverlayOneImage.jsx';

const styles = StyleSheet.create({
  button: {
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 50,
    borderColor: 'white',
    borderWidth: 1,
    marginBottom: 5,
  },
  header: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 20,
    paddingLeft: '7%',
  },
  iconWhite: {
    color: 'white',
    marginHorizontal: 5,
    marginRight: 10,
  },
  thumbnailContainer: {
    // flex: 1,
    marginVertical: 5,
    // padding: 2,
    alignItems: 'center',
    width: '50%',
  },
  linearGradient: {
    flex: 1,
  },
  topBar: {
    borderRadius: 8,
    paddingLeft: '7%',
    marginVertical: 20,
  },
  img: {
    width: '100%',
    margin: 0,
  },
  screen: {
    flex: 1,
  },
  text: {
    fontSize: 20,
    marginVertical: 10,
    color: 'black',
    textAlign: 'center',
  },
  messageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  message: {
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'white',
  },
  spinner: {
    position: 'absolute',
    top: '50%',
    left: '45%',
  },
});

const ImageGallery = () => {
  const { store, dispatch } = useContext(Context);
  const { images } = store;
  let userId;
  let token;
  let auth;
  const [oneImageData, setOneImageData] = useState({});
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const windowWidth = Number(Dimensions.get('window').width);
  const heightOfImage = (windowWidth / 2) * 0.95;

  /** To get userId and token for axios calls at every render */
  useEffect(() => {
    const getData = async () => {
      try {
        setLoading(true);
        userId = await AsyncStorage.getItem('@userId');
        token = await AsyncStorage.getItem('@sessionToken');
        // create authorization header
        auth = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.post(`${REACT_APP_BACKEND}/user/getuserdatabyid`, { userId }, auth);
        console.log('response: ', response);
        setLoading(false);
        dispatch(setImagesAction([...response.data.userProfile.images]));
      } catch (err) {
        setLoading(false);
        console.log(err);
      }
    };
    getData().then(() => console.log('getData successful!', images));
  }, []);
  const displayOneImage = (data, imgPath, dims) => {
    console.log('in data', data, imgPath, dims);
    console.log('dims data', dims);

    setOneImageData({ data, imgPath, dims });
    setOverlayVisible(true);
  };
  const closeOverlay = () => {
    setOverlayVisible(false);
  };
  /** Helper function to display all images stored in allImages state */
  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={[Colors.primary, Colors.orangeyRed]}
        style={styles.linearGradient}
        start={{ x: 0.9, y: 0.1 }}
        end={{ x: 0.1, y: 0.5 }}
      >
        <View style={styles.spinner}>
          <ActivityIndicator animating={loading} size="large" color="#ffff" />
        </View>

        {images.length > 0
          ? (
            <View style={styles.screen}>
              <Text style={styles.header}>Image Gallery</Text>
              <FlatList
                data={images}
                renderItem={({ item }) => (
                  <View style={styles.thumbnailContainer}>
                    <TouchableOpacity onPress={() => { displayOneImage(
                      item.result,
                      item.imagePath,
                      item.dimension,
                    ); }}
                    >
                      <Image
                        style={{ ...styles.img, height: heightOfImage, width: heightOfImage }}
                        source={{ uri: `${REACT_APP_BACKEND}/image${item.imagePath}` }}
                      />
                    </TouchableOpacity>
                  </View>
                )}
            // Setting the number of column
                numColumns={2}
                keyExtractor={(item, index) => index.toString()}
              />
              {overlayVisible
              && <OverlayOneImage backToGallery={closeOverlay} data={oneImageData} />}
            </View>
          )
          : (!loading && (
            <View style={styles.messageContainer}>
              <EmojiSadIcon style={styles.iconWhite} size={60} />
              <Text style={styles.message}>No images!
                You can save your favourite images after scanning an image.
              </Text>
            </View>
          )
          )}
      </LinearGradient>
    </View>
  );
};

export default ImageGallery;
