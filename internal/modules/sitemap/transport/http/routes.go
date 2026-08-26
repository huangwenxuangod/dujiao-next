package sitemaphttp

import "github.com/gin-gonic/gin"

// RegisterRoutes 注册站点根路径下的 SEO 资源路由。
func RegisterRoutes(engine gin.IRoutes, handler *Handler) {
	engine.GET("/sitemap.xml", handler.GetSitemap)
	engine.GET("/sitemap-index.xml", handler.GetSitemapIndex)
	engine.GET("/sitemap-static.xml", handler.GetSitemapShard)
	engine.GET("/sitemap-products-:page.xml", handler.GetSitemapShard)
	engine.GET("/sitemap-categories.xml", handler.GetSitemapShard)
	engine.GET("/sitemap-blog.xml", handler.GetSitemapShard)
	engine.GET("/sitemap-ru.xml", handler.GetSitemapShard)
	engine.GET("/robots.txt", handler.GetRobots)
}
