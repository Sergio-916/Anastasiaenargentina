import fs from 'fs'
import matter from 'gray-matter'

export default function getPostMetadata(basePath) {
    const folder = basePath + '/'
    const files = fs.readdirSync(folder)
    const markdownPosts = files.filter(file => file.endsWith('.md'))

    // get the file data
    const posts = markdownPosts.map((filename) => {
        const fileContents = fs.readFileSync(`${basePath}/${filename}`, 'utf8')
        const matterResult = matter(fileContents)
        return {
            title: matterResult.data.title,        
            bio: matterResult.data.description,
            date: new Date(matterResult.data.date), 
            time: matterResult.data.reading_time,
            slug: filename.replace('.md', '')
        }
    })
    return posts.sort((a, b) => b.date - a.date);
}