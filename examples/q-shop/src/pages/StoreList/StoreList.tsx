import { useState, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../state/store";
import LazyLoad from "../../components/common/LazyLoad";
import { setIsLoadingGlobal } from "../../state/features/globalSlice";
import { Store, upsertStores } from "../../state/features/storeSlice";
import { useFetchStores } from "../../hooks/useFetchStores";
import {
  StoresContainer,
  MyStoresCard,
  MyStoresCheckbox,
  WelcomeRow,
  WelcomeFont,
  WelcomeSubFont,
  WelcomeCol,
  QShopLogo,
  LogoRow
} from "./StoreList-styles";
import DefaultStoreImage from "../../assets/img/Q-AppsLogo.webp";
import { Grid, useTheme } from "@mui/material";
import { StoreCard } from "../Store/StoreCard/StoreCard";
import QShopLogoLight from "../../assets/img/QShopLogoLight.webp";
import QShopLogoDark from "../../assets/img/QShopLogo.webp";

/* Reviews notes
  Fetch 10 reviews of the store use fetch() API call
  Add them all up and divide by # of reviews to get the average rating
  In the resource of the review, we should put the rating inside the tag of the review.
  Preview of the rating in the title metadata (which is part of the metadata of the resource) 60 chars
  Preview of the review message in the description metadata (which is part of the metadata of the resource) 150 chars
  Put the review number inside the raw data JSON as well
  Use service DOCUMENT
  And then when they click on the actual, review, it will show the full review message and the rating by fetching the raw data
  When fetching the full list of reviews, don't use mode=ALL, use mode=LATEST
  Filter reviews by query by minlevel 1 and above
  Make sure user has at least one store order before beign able to leave a review
  const url = `/arbitrary/resources/search?service=DOCUMENT&query=${query}&limit=20&name=${name}&includemetadata=true&offset=${offset}&reverse=true`;
*/

export const StoreList = () => {
  const dispatch = useDispatch();
  const theme = useTheme();

  const user = useSelector((state: RootState) => state.auth.user);

  const [filterUserStores, setFilterUserStores] = useState<boolean>(false);

  // TODO: Need skeleton at first while the data is being fetched
  // Will rerender and replace if the hashmap wasn't found initially
  const hashMapStores = useSelector(
    (state: RootState) => state.store.hashMapStores
  );

  // Fetch My Stores from Redux
  const myStores = useSelector((state: RootState) => state.store.myStores);
  const stores = useSelector((state: RootState) => state.store.stores);

  const { getStore, checkAndUpdateResource } = useFetchStores();

  const getUserStores = useCallback(async () => {
    try {
      dispatch(setIsLoadingGlobal(true));
      const offset = stores.length;
      const query = `q-store-general`;
      // Fetch list of user stores' resources from Qortal blockchain
      const url = `/arbitrary/resources/search?service=STORE&query=${query}&limit=20&exactmatchnames=true&mode=ALL&includemetadata=true&offset=${offset}&reverse=true`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      });
      const responseData = await response.json();
      // Data returned from that endpoint of the API
      // tags, category, categoryName are not being used at the moment
      const structureData = responseData.map((storeItem: any): Store => {
        return {
          title: storeItem?.metadata?.title,
          category: storeItem?.metadata?.category,
          categoryName: storeItem?.metadata?.categoryName,
          tags: storeItem?.metadata?.tags || [],
          description: storeItem?.metadata?.description,
          created: storeItem.created,
          updated: storeItem.updated,
          owner: storeItem.name,
          id: storeItem.identifier
        };
      });
      // Add stores to localstate & guard against duplicates
      const copiedStores: Store[] = [...stores];
      structureData.forEach((storeItem: Store) => {
        const index = stores.findIndex((p: Store) => p.id === storeItem.id);
        if (index !== -1) {
          copiedStores[index] = storeItem;
        } else {
          copiedStores.push(storeItem);
        }
      });
      dispatch(upsertStores(copiedStores));
      // Get the store raw data from getStore API Call only if the hashmapStore doesn't have the store or if the store is more recently updated than the existing store
      for (const content of structureData) {
        if (content.owner && content.id) {
          const res = checkAndUpdateResource({
            id: content.id,
            updated: content.updated
          });
          if (res) {
            getStore(content.owner, content.id, content);
          }
        }
      }
    } catch (error) {
    } finally {
      dispatch(setIsLoadingGlobal(false));
    }
  }, [stores]);

  // Get all stores on mount or if user changes
  const getStores = useCallback(async () => {
    await getUserStores();
  }, [getUserStores, user?.name]);

  // Filter to show only the user's stores

  const handleFilterUserStores = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFilterUserStores(event.target.checked);
  };

  // Memoize the filtered stores to prevent rerenders
  const filteredStores = useMemo(() => {
    if (filterUserStores) {
      return myStores;
    } else {
      return stores;
    }
  }, [filterUserStores, stores, myStores, user?.name]);

  return (
    <>
      <StoresContainer container>
        <WelcomeRow item xs={12}>
          <LogoRow>
            <QShopLogo
              src={
                theme.palette.mode === "dark" ? QShopLogoLight : QShopLogoDark
              }
              alt="Q-Shop Logo"
            />
            <WelcomeCol>
              <WelcomeFont>Welcome to Q-Shop 👋</WelcomeFont>
              <WelcomeSubFont>
                Explore the latest of what the Qortal community has for sale.
              </WelcomeSubFont>
            </WelcomeCol>
          </LogoRow>
          <WelcomeCol>
            {user && (
              <MyStoresCard>
                <MyStoresCheckbox
                  checked={filterUserStores}
                  onChange={handleFilterUserStores}
                  inputProps={{ "aria-label": "controlled" }}
                />
                See My Stores
              </MyStoresCard>
            )}
          </WelcomeCol>
        </WelcomeRow>
        <Grid item xs={12}>
          <Grid container spacing={3}>
            {filteredStores.map((store: Store) => {
              let storeItem = store;
              const existingStore = hashMapStores[store.id];
              // Check in case hashmap data isn't there yet due to async API calls.
              // If it's not there, component will rerender once it receives the metadata
              if (existingStore) {
                storeItem = existingStore;
              }
              const storeId = storeItem?.id || "";
              const storeOwner = storeItem?.owner || "";
              const storeTitle = storeItem?.title || "missing metadata";
              const storeLogo = storeItem?.logo || DefaultStoreImage;
              const storeDescription =
                storeItem?.description || "missing metadata";
              return (
                <StoreCard
                  storeTitle={storeTitle || ""}
                  storeLogo={storeLogo || ""}
                  storeDescription={storeDescription || ""}
                  storeId={storeId || ""}
                  storeOwner={storeOwner || ""}
                  key={storeId}
                  userName={user?.name || ""}
                />
              );
            })}
          </Grid>
        </Grid>
      </StoresContainer>
      <LazyLoad onLoadMore={getStores}></LazyLoad>
    </>
  );
};
