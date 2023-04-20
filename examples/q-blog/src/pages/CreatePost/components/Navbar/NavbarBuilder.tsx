import React, { useCallback, useEffect } from 'react'

import {
  Button,
  Box,
  Typography,
  Toolbar,
  AppBar,
  Select,
  InputLabel,
  FormControl,
  MenuItem,
  TextField,
  SelectChangeEvent,
  OutlinedInput,
  List,
  ListItem,
  useTheme
} from '@mui/material'
import { styled } from '@mui/system'
import { useSelector } from 'react-redux'
import { RootState } from '../../../../state/store'
import ShortUniqueId from 'short-unique-id'

const uid = new ShortUniqueId()
interface INavbar {
  saveNav: (navMenu: any, navbarConfig: any) => void
  removeNav: () => void
  close: () => void
}

export const Navbar = ({ saveNav, removeNav, close }: INavbar) => {
  const { user } = useSelector((state: RootState) => state.auth)
  const { currentBlog } = useSelector((state: RootState) => state.global)
  const theme = useTheme()
  const [navTitle, setNavTitle] = React.useState<string>('')
  const [blogPostOption, setBlogPostOption] = React.useState<any | null>(null)
  const [options, setOptions] = React.useState<any>([])
  const [navItems, setNavItems] = React.useState<any>([])
  const handleOptionChange = (event: SelectChangeEvent<string>) => {
    const optionId = event.target.value
    const selectedOption = options.find((option: any) => option.id === optionId)
    setBlogPostOption(selectedOption || null)
  }

  useEffect(() => {
    if (currentBlog && currentBlog?.navbarConfig) {
      const { navItems } = currentBlog.navbarConfig
      if (!navItems || !Array.isArray(navItems)) return

      setNavItems(navItems)
    }
  }, [currentBlog])

  const getOptions = useCallback(async () => {
    // if(!user || !currentBlog) return
    // const name = user?.name
    // const blog = currentBlog?.blogId
    const name = 'Phil'
    const blog = 'q-blog-EnWmcZ'
    try {
      const url = `/arbitrary/resources/search?service=BLOG_POST&query=${blog}-post-&limit=20&name=${name}&includemetadata=true&reverse=true`
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      const responseData = await response.json()
      const formatOptions = responseData.map((option: any) => {
        return {
          id: option.identifier,
          name: option?.metadata.title
        }
      })
      console.log({ responseData })
      setOptions(formatOptions)
    } catch (error) {}
  }, [])
  useEffect(() => {
    getOptions()
  }, [getOptions])
  const addToNav = () => {
    if (!navTitle || !blogPostOption) return
    setNavItems((prev: any) => [
      ...prev,
      {
        id: uid(),
        name: navTitle,
        postId: blogPostOption.id
      }
    ])
  }

  const handleSaveNav = () => {
    if (!currentBlog) return
    saveNav(navItems, currentBlog?.navbarConfig || {})
  }

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            flexWrap: 'wrap'
          }}
        >
          <Box>
            <TextField
              label="Nav Item name"
              variant="outlined"
              fullWidth
              value={navTitle}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setNavTitle(e.target.value)
              }
              inputProps={{ maxLength: 40 }}
              sx={{
                marginBottom: 2,
                backgroundColor: theme.palette.background.default,
                border: `1px solid ${theme.palette.text.primary}`
              }}
            />
          </Box>
          <Box>
            <FormControl
              fullWidth
              sx={{
                marginBottom: 2,
                width: '150px',
                backgroundColor: theme.palette.background.default,
                border: `1px solid ${theme.palette.text.primary}`
              }}
            >
              <InputLabel id="Post">Select a Post</InputLabel>
              <Select
                labelId="Post"
                input={<OutlinedInput label="Select a Post" />}
                value={blogPostOption?.id || ''}
                onChange={handleOptionChange}
                MenuProps={{
                  sx: {
                    maxHeight: '300px' // Adjust this value to set the max height
                  }
                }}
              >
                {options.map((option: any) => (
                  <MenuItem key={option.id} value={option.id}>
                    {option.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>
        <Box>
          <Button onClick={addToNav}>Add</Button>
        </Box>
      </Box>

      <Box>
        <List
          sx={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            flex: '1',
            overflow: 'auto'
          }}
        >
          {navItems.map((navItem: any) => (
            <ListItem key={navItem.id}>
              <Typography>{navItem.name}</Typography>
            </ListItem>
          ))}
        </List>
      </Box>
      <Button onClick={handleSaveNav}>Save Navbar</Button>
      <Button onClick={removeNav}>Remove Navbar</Button>
      <Button onClick={close}>Close</Button>
    </>
  )
}
