import React, { useEffect, useState } from "react";
import {
  AddCoverImageButton,
  AddCrowdFundButton,
  AddLogoIcon,
  CATContainer,
  CoverImagePreview,
  CrowdfundActionButton,
  CrowdfundActionButtonRow,
  CrowdfundCardTitle,
  CustomBoundedTextField,
  CustomInputField,
  LogoPreviewRow,
  ModalBody,
  NewCrowdFundFont,
  NewCrowdfundTimeDescription,
  NewCrowdfundTitle,
  TimesIcon,
} from "./Crowdfund-styles";
import { Box, Modal, useTheme } from "@mui/material";
import ReactQuill, { Quill } from "react-quill";
import ImageResize from "quill-image-resize-module-react";
import ShortUniqueId from "short-unique-id";
import "react-quill/dist/quill.snow.css";
import { FileAttachment } from "./FileAttachment";
import { useDispatch, useSelector } from "react-redux";
import { setNotification } from "../../state/features/notificationsSlice";
import { objectToBase64, uint8ArrayToBase64 } from "../../utils/toBase64";
import { RootState } from "../../state/store";
import {
  ATTACHMENT_BASE,
  CROWDFUND_BASE,
} from "../../constants/Identifiers.ts";
import dayjs, { Dayjs } from "dayjs";
import isBetween from "dayjs/plugin/isBetween"; // Import the plugin
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import duration from "dayjs/plugin/duration";
import bs58 from "bs58";
import {
  addCrowdfundToBeginning,
  addToHashMap,
  upsertCrowdfunds,
} from "../../state/features/crowdfundSlice";
import ImageUploader from "../ImageUploader";
import { DesktopDateTimePicker } from "@mui/x-date-pickers";
import { PiggybankSVG } from "../../assets/svgs/PiggybankSVG";
import { getDaySummary } from "../../utils/time.ts";
import { truncateNumber } from "../../utils/numberFunctions.ts";

dayjs.extend(isBetween);
dayjs.extend(duration);
Quill.register("modules/imageResize", ImageResize);

const uid = new ShortUniqueId();

const modules = {
  imageResize: {
    parchment: Quill.import("parchment"),
    modules: ["Resize", "DisplaySize"],
  },
  toolbar: [
    ["bold", "italic", "underline", "strike"], // styled text
    ["blockquote", "code-block"], // blocks
    [{ header: 1 }, { header: 2 }], // custom button values
    [{ list: "ordered" }, { list: "bullet" }], // lists
    [{ script: "sub" }, { script: "super" }], // superscript/subscript
    [{ indent: "-1" }, { indent: "+1" }], // outdent/indent
    [{ direction: "rtl" }], // text direction
    [{ size: ["small", false, "large", "huge"] }], // custom dropdown
    [{ header: [1, 2, 3, 4, 5, 6, false] }], // custom button values
    [{ color: [] }, { background: [] }], // dropdown with defaults
    [{ font: [] }], // font family
    [{ align: [] }], // text align
    ["clean"], // remove formatting
    ["image"], // image
  ],
};

interface NewCrowdfundProps {
  editId?: string;
  editContent?: null | {
    title: string;
    inlineContent: string;
    attachments: any[];
    user: string;
    coverImage: string | null;
  };
}
export const NewCrowdfund = ({ editId, editContent }: NewCrowdfundProps) => {
  const theme = useTheme();
  const [qFundDuration, setQFundDuration] = React.useState<Dayjs | null>(
    dayjs().add(5, "day")
  );
  const [goalValue, setGoalValue] = useState<number | string>("");
  const dispatch = useDispatch();
  const username = useSelector((state: RootState) => state.auth?.user?.name);
  const userAddress = useSelector(
    (state: RootState) => state.auth?.user?.address
  );

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [inlineContent, setInlineContent] = useState("");
  const [attachments, setAttachments] = useState<any[]>([]);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [blocksPerMinute, setBlocksPerMinute] = useState<number>(1);
  const minGoal = 1;
  const maxGoal = 1_000_000;

  useEffect(() => {
    if (editContent) {
      setTitle(editContent?.title);
      setInlineContent(editContent?.inlineContent);
      setAttachments(editContent?.attachments);
      setCoverImage(editContent?.coverImage || null);
    }
  }, [editContent]);

  const onClose = () => {
    setIsOpen(false);
  };

  const minutesPerDay = 60 * 24;

  const updateBlocksPerMinute = () => {
    getDaySummary().then(response => {
      const blockTime = response.blockCount / minutesPerDay;
      setBlocksPerMinute(blockTime);
    });
  };

  const getBlocksInDuration = (minutes: number) => {
    const blocksInDuration = minutes * blocksPerMinute;
    return truncateNumber(Math.abs(blocksInDuration), 0);
  };

  useEffect(() => {
    updateBlocksPerMinute();
  }, []);

  const diffInMins = React.useMemo(() => {
    updateBlocksPerMinute();
    const blocksInDuration = getBlocksInDuration(
      dayjs().diff(qFundDuration, "minute")
    );
    return +blocksInDuration;
  }, [qFundDuration, blocksPerMinute]);

  // Define the type for your POST request body
  interface PostRequestBody {
    ciyamAtVersion: number;
    codeBytesBase64: string | undefined;
    dataBytesBase64: string | undefined;
    numCallStackPages: number;
    numUserStackPages: number;
    minActivationAmount: number;
  }

  // Define the function to make the POST request
  async function fetchPostRequest(
    url: string,
    body: PostRequestBody
  ): Promise<string> {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const text = await response.text();
      return text;
    } catch (error: any) {
      console.error(
        "There was an error with the fetch operation:",
        error.message
      );
      throw error;
    }
  }

  const dataBytePlaceholder = [
    0, 0, 0, 0, 0, 0, 0, 15, 0, 0, 0, 0, 119, 53, -108, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 58, 113, -123, -80, 21, -38, 49, -10, 3, 92, 116, -59,
    -123, -65, 37, -86, -126, 45, -75, 38, 29, 0, 98, 12, 12, 0, 0, 0, 0, 0, 0,
    0,
  ];

  function adjustByteValue(byteValue) {
    return (byteValue + 256) % 256;
  }

  function setLongValue(array, position, value) {
    const buffer = new ArrayBuffer(8);
    const view = new DataView(buffer);

    view.setUint32(0, Math.floor(value / 0x100000000));
    view.setUint32(4, value >>> 0);

    for (let i = 0; i < 8; i++) {
      array[position + i] = view.getInt8(i) & 0xff; // Correctly handle the byte qFundDuration
    }
  }

  // Function to replace a qFundDuration at a given position in the original array with an array
  function replaceArraySlice(originalArray, position, newArray) {
    for (let i = 0; i < newArray.length; i++) {
      originalArray[position + i] = newArray[i];
    }
  }

  const codeBytes =
    "NQMBAAAABTUDAAAAAAI3BAYAAAACAAAAAgAAAAACAAAAAwAAAAJLAAAAAwAAAAAAAAAgJQAAAAM1BAAAAAAEIAAAAAQAAAABGTgBHwAAAAAAAAAKMgQDKDAzAwQAAAAFNQElAAAABhsAAAAGByg1AwcAAAAFIAAAAAUAAAACCyg1AwUAAAAHJAAAAAcAAAAI0jUDBgAAAAkyAwozBAIAAAAJGgAAAFk=";

  const createBytes = (goalAmount: number, blocks: number, address: string) => {
    try {
      const newArray = [...dataBytePlaceholder];

      setLongValue(newArray, 0, blocks);
      const adjustedInput = goalAmount * 1e8;
      setLongValue(newArray, 8, adjustedInput);
      const decodedAwardeeAddress = bs58.decode(address).map(adjustByteValue);
      replaceArraySlice(newArray, 80, decodedAwardeeAddress);
      const byteArray: Uint8Array = new Uint8Array(newArray);
      const encodedString: string = uint8ArrayToBase64(byteArray);
      return encodedString;
    } catch (error) {
      console.error(error);
    }
  };

  function toSignedByte(value) {
    if (value > 127) {
      return value - 256;
    }
    return value;
  }

  async function publishQDNResource() {
    try {
      if (!userAddress) throw new Error("Unable to locate user address");
      let errorMsg = "";
      let name = "";
      if (username) {
        name = username;
      }
      if (!name) {
        errorMsg =
          "Cannot publish without access to your name. Please authenticate.";
      }
      if (!title) {
        errorMsg = "Cannot publish without a title";
      }
      if (editId && editContent?.user !== name) {
        errorMsg = "Cannot publish another user's resource";
      }

      if (errorMsg) {
        dispatch(
          setNotification({
            msg: errorMsg,
            alertType: "error",
          })
        );
        return;
      }

      const sanitizeTitle = title
        .replace(/[^a-zA-Z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim()
        .toLowerCase();

      const requestBody: PostRequestBody = {
        ciyamAtVersion: 2,
        codeBytesBase64: undefined,
        dataBytesBase64: undefined,
        numCallStackPages: 0,
        numUserStackPages: 0,
        minActivationAmount: 0,
      };
      // CHANGE BACK AFTER TESTING
      // const blocksToGoal = 15;
      const differenceInMinutes = dayjs().diff(qFundDuration, "minute");
      const blocksToGoal = Math.abs(differenceInMinutes * blocksPerMinute);
      if (blocksToGoal < 29 || blocksToGoal > 43200)
        throw new Error("end of crowdfund needs to be between 2880 and 43200");
      if (!goalValue) throw new Error("Goal amount must be one or greater!");
      requestBody.dataBytesBase64 = createBytes(
        +goalValue,
        blocksToGoal,
        userAddress
      );

      requestBody.codeBytesBase64 = codeBytes;
      const creationBytes = await fetchPostRequest("/at/create", requestBody);
      const response = await qortalRequest({
        action: "DEPLOY_AT",
        creationBytes,
        name: "q-fund crowdfund",
        description: sanitizeTitle.slice(0, 30),
        type: "crowdfund",
        tags: "q-fund",
        amount: 0.2,
        assetId: 0,
      });

      const crowdfundObject: any = {
        title,
        createdAt: Date.now(),
        version: 1,
        attachments: [],
        description,
        inlineContent,
        coverImage,
        deployedAT: {
          ...response,
          blocksToGoal,
          goalValue: +goalValue,
          userAddress,
        },
      };

      const id = uid();

      const attachmentArray: any[] = [];
      const attachmentArrayToSave: any[] = [];
      for (const attachment of attachments) {
        const alreadyExits = !!attachment?.identifier;

        if (alreadyExits) {
          attachmentArray.push(attachment);
          continue;
        }
        const id = uid();
        const id2 = uid();
        const identifier = `${ATTACHMENT_BASE}${id}_${id2}`;
        const fileExtension = attachment?.name?.split(".")?.pop();
        if (!fileExtension) {
          throw new Error("One of your attachments does not have an extension");
        }
        let service = "FILE";
        const type = attachment?.type;
        if (type.startsWith("audio/")) {
          service = "AUDIO";
        }
        if (type.startsWith("video/")) {
          service = "VIDEO";
        }
        const obj: any = {
          name,
          service,
          filename: attachment.name,
          identifier,
          file: attachment,
          type: attachment?.type,
          size: attachment?.size,
        };

        attachmentArray.push(obj);
        attachmentArrayToSave.push(obj);
      }
      crowdfundObject.attachments = attachmentArray;
      if (attachmentArrayToSave.length > 0) {
        const multiplePublish = {
          action: "PUBLISH_MULTIPLE_QDN_RESOURCES",
          resources: [...attachmentArrayToSave],
        };
        await qortalRequest(multiplePublish);
      }

      const identifier = editId
        ? editId
        : `${CROWDFUND_BASE}${sanitizeTitle.slice(0, 30)}_${id}`;
      const crowdfundObjectToBase64 = await objectToBase64(crowdfundObject);
      // Description is obtained from raw data
      const requestBody2: any = {
        action: "PUBLISH_QDN_RESOURCE",
        name: name,
        service: "DOCUMENT",
        data64: crowdfundObjectToBase64,
        title: title.slice(0, 50),
        identifier,
      };

      await qortalRequest(requestBody2);
      dispatch(
        setNotification({
          msg: "Crowdfund deployed and published",
          alertType: "success",
        })
      );
      const objToStore: any = {
        ...crowdfundObject,
        title: title,
        id: identifier,
        user: name,
        created: Date.now(),
        updated: Date.now(),
      };
      if (!editId) {
        dispatch(addCrowdfundToBeginning(objToStore));
      } else {
        dispatch(upsertCrowdfunds([objToStore]));
      }

      dispatch(addToHashMap(objToStore));

      setTitle("");
      setInlineContent("");
      setAttachments([]);
      setCoverImage(null);
      setIsOpen(false);
      setGoalValue("");
      setQFundDuration(dayjs().add(5, "day"));
    } catch (error: any) {
      let notificationObj: any = null;
      if (typeof error === "string") {
        notificationObj = {
          msg: error || "Failed to publish crowdfund",
          alertType: "error",
        };
      } else if (typeof error?.error === "string") {
        notificationObj = {
          msg: error?.error || "Failed to publish crowdfund",
          alertType: "error",
        };
      } else {
        notificationObj = {
          msg: error?.message || "Failed to publish crowdfund",
          alertType: "error",
        };
      }
      if (!notificationObj) return;
      dispatch(setNotification(notificationObj));

      throw new Error("Failed to publish crowdfund");
    }
  }

  const formatDuration = (totalMinutes: number) => {
    const durationObj = dayjs.duration(totalMinutes, "minutes");

    const days = durationObj.days();
    const hours = durationObj.hours();
    const minutes = durationObj.minutes();

    return `${days > 0 ? days + " days, " : ""}${
      hours > 0 ? hours + " hours, " : ""
    }${minutes} minutes`;
  };

  const minDateTime = dayjs().add(2, "day");
  const maxDateTime = dayjs().add(30, "day");
  const startQFundColor = "#87CEFA";
  return (
    <>
      {username && (
        <>
          {editId ? null : (
            <CATContainer>
              <AddCrowdFundButton
                style={{ backgroundColor: startQFundColor }}
                onClick={() => setIsOpen(true)}
              >
                <PiggybankSVG height={"24"} width={"24"} color={"#ffffff"} />
                <CrowdfundCardTitle>Start a Q-Fund</CrowdfundCardTitle>
              </AddCrowdFundButton>
            </CATContainer>
          )}
        </>
      )}

      <Modal
        open={isOpen}
        onClose={onClose}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <ModalBody>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            {editId ? (
              <NewCrowdfundTitle>Update Crowdfund</NewCrowdfundTitle>
            ) : (
              <NewCrowdfundTitle>Create Crowdfund</NewCrowdfundTitle>
            )}
            {!coverImage ? (
              <ImageUploader onPick={(img: string) => setCoverImage(img)}>
                <AddCoverImageButton variant="contained">
                  Add Cover Image
                  <AddLogoIcon
                    sx={{
                      height: "25px",
                      width: "auto",
                    }}
                  ></AddLogoIcon>
                </AddCoverImageButton>
              </ImageUploader>
            ) : (
              <LogoPreviewRow>
                <CoverImagePreview src={coverImage} alt="logo" />
                <TimesIcon
                  color={theme.palette.text.primary}
                  onClickFunc={() => setCoverImage(null)}
                  height={"32"}
                  width={"32"}
                ></TimesIcon>
              </LogoPreviewRow>
            )}
          </Box>

          <CustomInputField
            name="title"
            label="Title of crowdfund"
            variant="filled"
            value={title}
            onChange={e => setTitle(e.target.value)}
            inputProps={{ maxLength: 180 }}
            multiline
            maxRows={3}
            required
          />
          <CustomInputField
            name="description"
            label="Describe your crowdfund in a few words"
            variant="filled"
            value={description}
            onChange={e => setDescription(e.target.value)}
            inputProps={{ maxLength: 180 }}
            multiline
            maxRows={3}
            required
          />
          <CustomBoundedTextField
            label="Goal Amount (QORT)"
            variant="filled"
            value={goalValue}
            onChange={value =>
              value ? setGoalValue(+value) : setGoalValue("")
            }
            minValue={minGoal}
            maxValue={maxGoal}
            addIconButtons={true}
            allowDecimals={false}
            required
          />
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DesktopDateTimePicker
              label="End date of crowdfund. Min 2 days Max 30 days"
              value={qFundDuration}
              onChange={newValue => setQFundDuration(newValue)}
              minDateTime={minDateTime}
              maxDateTime={maxDateTime}
            />
          </LocalizationProvider>
          <NewCrowdfundTimeDescription>
            Length of crowdfund: {diffInMins} blocks ~{" "}
            {formatDuration(+diffInMins / blocksPerMinute)}
          </NewCrowdfundTimeDescription>

          <NewCrowdFundFont>Add necessary files - optional</NewCrowdFundFont>
          <FileAttachment
            setAttachments={setAttachments}
            attachments={attachments}
          />
          <NewCrowdFundFont>Describe your objective in depth</NewCrowdFundFont>
          <ReactQuill
            theme="snow"
            value={inlineContent}
            onChange={setInlineContent}
            modules={modules}
          />
          <CrowdfundActionButtonRow>
            <CrowdfundActionButton
              onClick={() => {
                onClose();
              }}
              variant="contained"
              color="error"
            >
              Cancel
            </CrowdfundActionButton>
            <CrowdfundActionButton
              variant="contained"
              onClick={() => {
                publishQDNResource();
              }}
            >
              Publish
            </CrowdfundActionButton>
          </CrowdfundActionButtonRow>
        </ModalBody>
      </Modal>
    </>
  );
};
