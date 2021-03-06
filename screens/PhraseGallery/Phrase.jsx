import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { REACT_APP_BACKEND } from 'react-native-dotenv';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  View, Text, ScrollView, Dimensions, Pressable, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { v4 as uuidv4 } from 'uuid';
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
  renderers,
} from 'react-native-popup-menu';
import { ChevronDownIcon, MicrophoneIcon, XIcon } from 'react-native-heroicons/solid';
import { EmojiSadIcon, PlusCircleIcon } from 'react-native-heroicons/outline';
import { LinearGradient } from 'expo-linear-gradient';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import {
  Context,
  setPhrasesAction,
  setCategoriesAction,
  selectCategoryAction,
  setNewCategoryNameAction,
  removePhraseAction,
  removeCategoryAction,
} from '../../Context.jsx';
import Card from '../../components/Card.jsx';
import Colors from '../../utils/colors.js';
import speakText from '../../utils/textToSpeech.js';
import ModalComponent from '../../components/Modal.jsx';
import Input from '../../components/Input.jsx';
import CustomButton from '../../components/CustomButton.jsx';
import Pill from '../../components/ViagraPill.jsx';
import styles from './Phrase.styles.js';

const PhraseGallery = () => {
  const { store, dispatch } = useContext(Context);
  const {
    phrases, categories, selectedCategory, newCategoryName, speechSpeed, speechPitch,
  } = store;
  const [newCatModalVisible, setNewCatModalVisible] = useState(false);
  const [phraseModalVisible, setPhraseModalVisible] = useState(false);
  const [deleteCatModalVisible, setDeleteCatModalVisible] = useState(false);
  const navBarHeight = useBottomTabBarHeight();

  const [selectedPhrase, setSelectedPhrase] = useState({});
  const [loading, setLoading] = useState(false);

  const [catToDelete, setCatToDelete] = useState();
  const windowWidth = Number(Dimensions.get('window').width);

  /** To get userId and token for axios calls at every render */
  useEffect(() => {
    const getData = async () => {
      try {
        setLoading(true);
        const userId = await AsyncStorage.getItem('@userId');
        const token = await AsyncStorage.getItem('@sessionToken');
        // create authorization header
        const auth = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.post(`${REACT_APP_BACKEND}/user/getuserdatabyid`, { userId }, auth);
        setLoading(false);
        dispatch(setPhrasesAction([...response.data.userProfile.phrases]));
        dispatch(setCategoriesAction([...response.data.userProfile.categories]));
      } catch (err) {
        setLoading(false);
        console.log(err);
      }
    };
    getData().then(() => console.log('getData successful!'));
  }, [selectedPhrase]);

  /** call backend api to create new category by userId */
  const createNewCategory = async (newCategory) => {
    const userId = await AsyncStorage.getItem('@userId');
    const token = await AsyncStorage.getItem('@sessionToken');
    // create authorization header
    const auth = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios
      .post(`${REACT_APP_BACKEND}/phrase/addnewcategory`, { userId, newCategory }, auth);
    dispatch(setCategoriesAction([...categories, {
      _id: response.data,
      name: newCategory,
    }]));
  };

  /** call backend api to add current phrase into selected categories */
  const deletePhrase = async (phraseId) => {
    const userId = await AsyncStorage.getItem('@userId');
    const token = await AsyncStorage.getItem('@sessionToken');
    // create authorization header
    const auth = { headers: { Authorization: `Bearer ${token}` } };
    await axios
      .post(`${REACT_APP_BACKEND}/phrase/deletephrase`, { userId, phraseId }, auth);
    dispatch(removePhraseAction(phraseId));
    setPhraseModalVisible(false);
  };

  /** call backend api to add current phrase into selected categories */
  const deleteCategory = async () => {
    const userId = await AsyncStorage.getItem('@userId');
    const token = await AsyncStorage.getItem('@sessionToken');
    // create authorization header
    const auth = { headers: { Authorization: `Bearer ${token}` } };
    setLoading(true);
    await axios
      .post(
        `${REACT_APP_BACKEND}/phrase/deletecategory`,
        { userId, categoryToDelete: catToDelete },
        auth,
      );
    dispatch(removeCategoryAction(catToDelete));
    setLoading(false);
    setDeleteCatModalVisible(false);
  };

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
        {newCatModalVisible && (
        <ModalComponent
          modalVisible={newCatModalVisible}
          setModalVisible={setNewCatModalVisible}
        >
          <Card style={styles.card}>
            <Text style={styles.modalTitle}>New category</Text>
            <Input
              placeholder="Category name"
              onChangeText={(el) => dispatch(setNewCategoryNameAction(el))}
              style={styles.input}
            />
            <CustomButton
              style={styles.button}
              title="Create"
              onPress={() => {
                createNewCategory(newCategoryName);
                setNewCatModalVisible(false);
              }}
            />
          </Card>
        </ModalComponent>
        )}
        {phraseModalVisible && (
        <ModalComponent
          modalVisible={phraseModalVisible}
          setModalVisible={setPhraseModalVisible}
        >
          <Card style={styles.card}>
            {console.log('SELECTED PHRASE', selectedPhrase)}
            <Text style={[styles.text, { fontSize: 16 }]}>Categories</Text>
            <Text style={styles.helperText}>
              Tap to toggle the categories{'\n'}
              that this phrase belongs to
            </Text>
            <View style={styles.pillsContainer}>
              {categories && categories
                .filter((category) => category.name !== 'All Phrases')
                .map((category) => (
                  <Pill
                    key={uuidv4()}
                    title={category.name} // particular category of the pill
                    selectedPhrase={selectedPhrase} // selectedphrase obj
                    setSelectedPhrase={setSelectedPhrase}
                    selectedBool={selectedPhrase.category.includes(category.name)}
                  />
                ))}
            </View>
            <View
              style={{
                borderBottomColor: 'black',
                borderBottomWidth: 1,
              }}
            />
            <CustomButton
              style={styles.redButton}
              title="Delete Phrase"
              onPress={() => {
                deletePhrase(selectedPhrase._id);
              }}
            />
          </Card>
        </ModalComponent>
        )}
        {deleteCatModalVisible && (
        <ModalComponent
          modalVisible={deleteCatModalVisible}
          setModalVisible={setDeleteCatModalVisible}
        >
          <Card style={styles.card}>
            <Text style={styles.modalTitle}>Are you sure you want to</Text>
            <Text style={styles.modalTitle}>delete this category?</Text>
            {loading
              ? (<ActivityIndicator animating={loading} size="large" color="#FF9B53" style={styles.activityIndicator} />)
              : (
                <CustomButton
                  style={styles.redButton}
                  title="Delete"
                  onPress={() => {
                    deleteCategory();
                    setNewCatModalVisible(false);
                  }}
                />
              )}

          </Card>
        </ModalComponent>
        )}
        {phrases.length > 0 && (
        <Menu
          renderer={renderers.SlideInMenu}
        >
          <MenuTrigger style={styles.dropdownTrigger}>
            <Text style={styles.header}>{selectedCategory}</Text>
            <ChevronDownIcon style={styles.iconWhite} size={28} />
          </MenuTrigger>
          <MenuOptions optionsContainerStyle={
            {
              ...styles.optionsContainer,
              width: windowWidth,
              paddingBottom: navBarHeight,
            }
          }
          >
            {categories.map((oneCategory) => (

              <MenuOption
                key={oneCategory._id}
                style={{ ...styles.options, width: windowWidth }}
                onSelect={() => dispatch(selectCategoryAction(oneCategory.name))}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={styles.circle} />
                  <Text style={[styles.text, styles.bold]}>{oneCategory.name}</Text>
                </View>
                <Pressable
                  onPress={() => {
                    setCatToDelete(oneCategory._id);
                    setDeleteCatModalVisible(true);
                  }}
                  style={{ flexDirection: 'row', alignItems: 'center' }}
                >
                  {oneCategory.name !== 'All Phrases'
                  && (
                  <XIcon
                    size={16}
                    style={styles.iconBlack}
                  />
                  )}
                </Pressable>
              </MenuOption>
            ))}
            <MenuOption
              style={{ ...styles.options, width: windowWidth }}
              onSelect={() => setNewCatModalVisible(!newCatModalVisible)}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <PlusCircleIcon style={styles.iconBlack} size={32} />
                <Text style={[styles.text, styles.bold]}>
                  Create new category
                </Text>
              </View>
              <XIcon size={16} />
            </MenuOption>
          </MenuOptions>
        </Menu>
        )}
        <View style={styles.container}>
          {phrases.length > 0 ? (
            <ScrollView>
              <View style={styles.cardContainer}>
                {phrases
                  .filter((onePhrase) => onePhrase.category.includes(selectedCategory))
                  .map((onePhrase) => (
                    <Card
                      key={onePhrase._id}
                      style={styles.phraseCard}
                    >
                      <Pressable
                        onLongPress={() => {
                          setSelectedPhrase(onePhrase);
                          setPhraseModalVisible(true);
                        }}
                      >
                        <View style={styles.characters}>
                          <Text style={[
                            styles.text,
                            styles.bold,
                            { fontSize: 16 }]}
                          >{onePhrase.chinesePhrase}
                          </Text>
                          <TouchableOpacity
                            onPress={() => speakText(
                              onePhrase.chinesePhrase,
                              speechSpeed,
                              speechPitch,
                            )}
                          >
                            <MicrophoneIcon color="black" size={16} fill="black" />
                          </TouchableOpacity>
                        </View>
                        <Text style={[styles.text, styles.italics]}>{onePhrase.pinyin}</Text>
                        <Text style={styles.text}>{onePhrase.definition}</Text>
                      </Pressable>
                    </Card>
                  ))}
              </View>
            </ScrollView>
          ) : (!loading
            && (
            <View style={styles.messageContainer}>
              <EmojiSadIcon style={styles.iconWhite} size={60} />
              <Text style={styles.message}>No phrases!
                You can save your favourite phrases after scanning an image.
              </Text>
            </View>
            )
          )}
        </View>
      </LinearGradient>

    </View>
  );
};

export default PhraseGallery;
