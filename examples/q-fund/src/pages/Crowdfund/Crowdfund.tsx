import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../state/store";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Avatar,
  Box,
  Typography,
  useTheme,
} from "@mui/material";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import DownloadIcon from "@mui/icons-material/Download";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { formatDate } from "../../utils/time";
import { DisplayHtml } from "../../components/common/DisplayHtml";
import FileElement from "../../components/common/FileElement";
import { setIsLoadingGlobal } from "../../state/features/globalSlice";
import { crowdfundBase, updateBase } from "../../constants";
import { addToHashMap } from "../../state/features/crowdfundSlice";
import {
  AuthorTextComment,
  CrowdfundDescriptionRow,
  CrowdfundTitle,
  CrowdfundPageTitle,
  CrowdfundTitleRow,
  MainCol,
  MainContainer,
  Spacer,
  StyledCardColComment,
  StyledCardHeaderComment,
  AboutMyCrowdfund,
  CrowdfundInlineContentRow,
} from "../../components/Crowdfund/Crowdfund-styles";
import AudioPlayer, { PlayerBox } from "../../components/common/AudioPlayer";
import { NewCrowdfund } from "../../components/Crowdfund/NewCrowdfund";
import { CommentSection } from "../../components/common/Comments/CommentSection";
import { Donate } from "../../components/common/Donate/Donate";
import { CrowdfundProgress } from "../../components/common/Progress/Progress";
import { Countdown } from "../../components/common/Countdown/Countdown";
import moment from "moment";
import { NewUpdate } from "../../components/Crowdfund/NewUpdate";
import { Update } from "./Update";
import { AccountCircleSVG } from "../../assets/svgs/AccountCircleSVG";

export const Crowdfund = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { name, id } = useParams();

  const userAvatarHash = useSelector(
    (state: RootState) => state.global.userAvatarHash
  );

  const avatarUrl = useMemo(() => {
    let url = "";
    if (name && userAvatarHash[name]) {
      url = userAvatarHash[name];
    }

    return url;
  }, [userAvatarHash, name]);
  const [crowdfundData, setCrowdfundData] = useState<any>(null);
  const [currentAtInfo, setCurrentAtInfo] = useState<any>(null);
  const username = useSelector((state: RootState) => state.auth?.user?.name);
  const [updatesList, setUpdatesList] = useState<any[]>([]);
  const [atAddressBalance, setAtAddressBalance] = useState<any>(null);
  const [nodeInfo, setNodeInfo] = useState<any>(null);
  const interval = useRef<any>(null);
  const intervalBalance = useRef<any>(null);
  const atAddress = useMemo(() => {
    return crowdfundData?.deployedAT?.aTAddress || null;
  }, [crowdfundData]);
  const hashMapCrowdfunds = useSelector(
    (state: RootState) => state.crowdfund.hashMapCrowdfunds
  );

  const endDateRef = useRef<any>(null);

  const endDate = useMemo(() => {
    if (!currentAtInfo?.sleepUntilHeight || !nodeInfo?.height) return null;
    if (endDateRef.current) return endDateRef.current;

    const diff = +currentAtInfo?.sleepUntilHeight - +nodeInfo.height;
    const end = moment().add(diff, "minutes");
    endDateRef.current = end;
    return end;
  }, [currentAtInfo, nodeInfo]);
  const blocksRemaning = useMemo(() => {
    if (!currentAtInfo?.sleepUntilHeight || !nodeInfo?.height) return null;
    const diff = +currentAtInfo?.sleepUntilHeight - +nodeInfo.height;

    return diff;
  }, [currentAtInfo, nodeInfo]);

  const getCurrentAtInfo = React.useCallback(async atAddress => {
    console.log({ atAddress });
    try {
      const url = `/at/${atAddress}`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const responseDataSearch = await response.json();
      setCurrentAtInfo(responseDataSearch);
    } catch (error) {
      console.log(error);
    } finally {
      dispatch(setIsLoadingGlobal(false));
    }
  }, []);

  const getNodeInfo = React.useCallback(async () => {
    try {
      const url = `/blocks/height`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const responseDataSearch = await response.json();
      setNodeInfo({ height: responseDataSearch });
    } catch (error) {
      console.log(error);
    } finally {
      dispatch(setIsLoadingGlobal(false));
    }
  }, []);

  const getAtAddressInfo = React.useCallback(async atAddress => {
    try {
      const url = `/addresses/balance/${atAddress}`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const responseDataSearch = await response.json();
      setAtAddressBalance(responseDataSearch);
    } catch (error) {
      console.log(error);
    } finally {
      dispatch(setIsLoadingGlobal(false));
    }
  }, []);

  const getCrowdfundData = React.useCallback(
    async (name: string, id: string) => {
      try {
        if (!name || !id) return;
        dispatch(setIsLoadingGlobal(true));

        // Get the resource location here
        const url = `/arbitrary/resources/search?mode=ALL&service=DOCUMENT&query=${crowdfundBase}&limit=1&includemetadata=true&reverse=true&excludeblocked=true&name=${name}&exactmatchnames=true&offset=0&identifier=${id}`;
        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const responseDataSearch = await response.json();

        // Always comes back as an array, so you must find the correct one using array bracket notation
        if (responseDataSearch?.length > 0) {
          let resourceData = responseDataSearch[0];
          resourceData = {
            title: resourceData?.metadata?.title,
            category: resourceData?.metadata?.category,
            categoryName: resourceData?.metadata?.categoryName,
            tags: resourceData?.metadata?.tags || [],
            description: resourceData?.metadata?.description,
            created: resourceData?.created,
            updated: resourceData?.updated,
            user: resourceData.name,
            id: resourceData.identifier,
          };

          // Get raw data of the resource here
          const responseData = await qortalRequest({
            action: "FETCH_QDN_RESOURCE",
            name: name,
            service: "DOCUMENT",
            identifier: id,
          });

          if (responseData && !responseData.error) {
            const combinedData = {
              ...resourceData,
              ...responseData,
            };

            setCrowdfundData(combinedData);
            dispatch(addToHashMap(combinedData));
            console.log({ combinedData });
            if (combinedData?.deployedAT?.aTAddress) {
              getCurrentAtInfo(combinedData?.deployedAT?.aTAddress);
              getAtAddressInfo(combinedData?.deployedAT?.aTAddress);
            }
          }
        }
      } catch (error) {
        console.log(error);
      } finally {
        dispatch(setIsLoadingGlobal(false));
      }
    },
    []
  );

  const getUpdates = React.useCallback(async (name: string, id: string) => {
    try {
      if (!name || !id) return;
      const url = `/arbitrary/resources/search?mode=ALL&service=DOCUMENT&query=${updateBase}${id.slice(
        -12
      )}&limit=0&includemetadata=false&reverse=true&excludeblocked=true&name=${name}&exactmatchnames=true&offset=0`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const responseDataSearch = await response.json();
      setUpdatesList(responseDataSearch);
    } catch (error) {
      console.log(error);
    }
  }, []);

  React.useEffect(() => {
    if (name && id) {
      const existingCrowdfund = hashMapCrowdfunds[id];

      if (existingCrowdfund) {
        setCrowdfundData(existingCrowdfund);
        getCurrentAtInfo(existingCrowdfund?.deployedAT?.aTAddress);
        getAtAddressInfo(existingCrowdfund?.deployedAT?.aTAddress);
      } else {
        getCrowdfundData(name, id);
      }
      getUpdates(name, id);
      getNodeInfo();
    }
  }, [id, name, hashMapCrowdfunds]);

  const editContent = useMemo(() => {
    if (!crowdfundData) return null;
    const content = {
      title: crowdfundData?.title,
      inlineContent: crowdfundData?.inlineContent,
      attachments: crowdfundData?.attachments,
      user: crowdfundData?.user,
      coverImage: crowdfundData?.coverImage || null,
    };
    return content;
  }, [crowdfundData]);

  const checkNodeInfo = useCallback(() => {
    let isCalling = false;
    interval.current = setInterval(async () => {
      if (isCalling) return;
      isCalling = true;
      const res = await getNodeInfo();
      isCalling = false;
    }, 30000);
  }, [getNodeInfo]);

  useEffect(() => {
    checkNodeInfo();

    return () => {
      if (interval?.current) {
        clearInterval(interval.current);
      }
    };
  }, [checkNodeInfo]);
  const checkBalance = useCallback(
    atAddress => {
      let isCalling = false;
      intervalBalance.current = setInterval(async () => {
        if (isCalling) return;
        isCalling = true;
        const res = await getAtAddressInfo(atAddress);
        isCalling = false;
      }, 30000);
    },
    [getAtAddressInfo]
  );

  useEffect(() => {
    if (!atAddress) return;
    checkBalance(atAddress);

    return () => {
      if (intervalBalance?.current) {
        clearInterval(intervalBalance.current);
      }
    };
  }, [checkBalance, atAddress]);

  if (!crowdfundData) return null;
  return (
    <>
      <NewCrowdfund editId={id} editContent={editContent} />
      <MainContainer container spacing={2} direction={"row"}>
        <MainCol item xs={12} sm={6}>
          <CrowdfundTitleRow>
            {!avatarUrl ? (
              <AccountCircleSVG
                color={theme.palette.text.primary}
                width="80"
                height="80"
              />
            ) : (
              <img
                src={avatarUrl}
                alt="User Avatar"
                width="80"
                height="80"
                style={{
                  borderRadius: "50%",
                  color: theme.palette.text.primary,
                }}
              />
            )}
            <CrowdfundPageTitle>{crowdfundData?.title}</CrowdfundPageTitle>
          </CrowdfundTitleRow>
          <CrowdfundDescriptionRow>
            {crowdfundData?.description}
          </CrowdfundDescriptionRow>
          <AboutMyCrowdfund>About my Q-Fund</AboutMyCrowdfund>
          <CrowdfundInlineContentRow>
            <DisplayHtml html={crowdfundData?.inlineContent} />
          </CrowdfundInlineContentRow>
          {crowdfundData?.deployedAT?.aTAddress && (
            <Donate
              atAddress={crowdfundData?.deployedAT?.aTAddress}
              onSubmit={() => {
                return;
              }}
              onClose={() => {
                return;
              }}
            />
          )}
        </MainCol>
        <MainCol item xs={12} sm={6}>
          {crowdfundData?.deployedAT?.goalValue && !isNaN(atAddressBalance) && (
            <CrowdfundProgress
              raised={atAddressBalance}
              goal={crowdfundData?.deployedAT?.goalValue}
            />
          )}
          {endDate && blocksRemaning && (
            <Countdown endDate={endDate} blocksRemaning={blocksRemaning} />
          )}
          {name === username && (
            <NewUpdate crowdfundId={id} crowdfundName={name || ""} />
          )}
          <div style={{ width: "90%" }}>
            {updatesList.map(update => {
              return (
                <Accordion key={update.identifier}>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                  >
                    <Typography>
                      {moment(update.created).format("LLL")} update
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Update updateObj={update} />
                  </AccordionDetails>
                </Accordion>
              );
            })}
          </div>
          <Box
            sx={{
              width: "95%",
            }}
          >
            <StyledCardHeaderComment
              sx={{
                "& .MuiCardHeader-content": {
                  overflow: "hidden",
                },
              }}
            >
              <Box>
                <Avatar src={avatarUrl} alt={`${name}'s avatar`} />
              </Box>
              <StyledCardColComment>
                <AuthorTextComment
                  color={
                    theme.palette.mode === "light"
                      ? theme.palette.text.secondary
                      : "#d6e8ff"
                  }
                >
                  {name}
                </AuthorTextComment>
              </StyledCardColComment>
            </StyledCardHeaderComment>
            <Spacer height="25px" />
            <Spacer height="25px" />
            {crowdfundData?.attachments?.length > 0 && (
              <CrowdfundTitle
                variant="h1"
                color="textPrimary"
                sx={{
                  textAlign: "center",
                  textDecoration: "underline",
                }}
              >
                Attachments
              </CrowdfundTitle>
            )}

            <Spacer height="15px" />
          </Box>
          {crowdfundData?.attachments?.map(attachment => {
            if (attachment?.service === "AUDIO")
              return (
                <>
                  <AudioPlayer
                    fullFile={attachment}
                    filename={attachment.filename}
                    name={attachment.name}
                    identifier={attachment.identifier}
                    service="AUDIO"
                    jsonId={crowdfundData?.id}
                    user={crowdfundData?.user}
                  />
                  <Spacer height="15px" />
                </>
              );

            return (
              <>
                <PlayerBox
                  sx={{
                    minHeight: "55px",
                  }}
                >
                  <Box
                    sx={{ display: "flex", alignItems: "center", pl: 1, pr: 1 }}
                  >
                    <AttachFileIcon
                      sx={{
                        height: "16px",
                        width: "auto",
                      }}
                    ></AttachFileIcon>
                    <Typography
                      sx={{
                        fontSize: "14px",
                        wordBreak: "break-word",
                        marginBottom: "5px",
                      }}
                    >
                      {attachment?.filename}
                    </Typography>
                  </Box>
                  <Box
                    sx={{ display: "flex", alignItems: "center", pl: 1, pr: 1 }}
                  >
                    <FileElement
                      fileInfo={attachment}
                      title={attachment?.filename}
                      customStyles={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-end",
                      }}
                    >
                      <DownloadIcon />
                    </FileElement>
                  </Box>
                </PlayerBox>

                <Spacer height="15px" />
              </>
            );
          })}
        </MainCol>
      </MainContainer>
      <Spacer height="15px" />
      <CrowdfundTitle
        variant="h1"
        color="textPrimary"
        sx={{
          textAlign: "center",
          textDecoration: "underline",
        }}
      >
        Comments
      </CrowdfundTitle>
      <CommentSection postId={id || ""} postName={name || ""} />
    </>
  );
};
