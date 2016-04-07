from markdown.inlinepatterns import SimpleTagPattern
from markdown.treeprocessors import Treeprocessor
from markdown.preprocessors import Preprocessor
# from markdown.postprocessors import Postprocessor
from markdown.extensions import Extension
import re


# class MyPostprocessor(Postprocessor):
#    def run(self, text):
#        for graph in MyExtension.remember_lines:
#            text = text.replace('<p>```graph</p>', '<div class="mermaid">'+graph+'</div>', 1)
#
#        return text

class Treeprocessors(Treeprocessor):
    def run(self, root):
        self.alignment(root)

        if len(Extensions.remember_lines) > 0:
            i = 0
            for child in root:
                if child.text == '```graph':
                    child.text = Extensions.remember_lines[i]
                    child.tag = 'div'
                    child.set('class', 'mermaid')
                    i += 1

    def alignment(self, root):
        last_child = None
        list = root.getchildren()

        for child in list:
            if child.text == '}}':
                align = 'text-align: right'
            elif child.text == '{{':
                align = 'text-align: left'
            elif child.text == '{}':
                align = 'text-align: justify'
            elif child.text == '}{':
                align = 'text-align: center'
            else:
                align = ''

            if align:
                child.text = ''
                child.tag = 'div'
                child.set('style', align)
                last_child = child

            if last_child:
                last_child.append(child)


class Preprocessors(Preprocessor):
    is_graph = False
    graph = ""

    def run(self, lines):
        pattern = re.compile('@\[([a-zA-Z0-9-_ ]+)\]')
        new_lines = []
        Extensions.remember_lines = []
        Extensions.comment_list = '<ul>\n'
        self.graph = ""
        self.is_graph = False
        for index in range(len(lines)):
            if self.is_comment(lines[index]):
                form_line = lines[index].strip(' \n\r\t\f/')
                new_lines.append('\n---\n__Comment:__ ' + form_line + '\n\n---')
                Extensions.comment_list += '<li>' + form_line + '</li>\n'
            else:
                m = pattern.match(lines[index])
                if m is not None:
                    new_lines.append('\n---\n__Annotation:__ ' + m.group(1) + '\n\n---')
                else:
                    new_lines.append(self.graph_parser(lines[index]))

        if len(self.graph) > 0:
            new_lines.append(self.graph)

        Extensions.comment_list += '</ul>'
        return new_lines

    def is_comment(self, line):
        return line.strip(' \n\r\t\f').startswith('//')

    def graph_parser(self, line):
        form_line = line.lower().strip(' \n\r\t\f')

        if self.is_graph:
            if form_line != '```':
                self.graph += line + '\n'
            else:
                self.is_graph = False
                Extensions.remember_lines.append(self.graph)
                self.graph = ""
        else:
            if form_line == '```graph' or form_line == '``` graph':
                self.is_graph = True
                return '\n```graph\n'
            else:
                return line

        return ""


class Extensions(Extension):
    remember_lines = []
    comment_list = ""

    STRONG_RE = r'(\+\+)(.*?)\+\+'
    DEL_RE = r'(--)(.*?)--'
    INS_RE = r'(__)(.*?)__'
    EM_RE = r'(~~)(.*?)~~'

    def extendMarkdown(self, md, md_globals):
        md.preprocessors.add("GraphComment", Preprocessors(md), '_end')
        md.treeprocessors.add("Graph", Treeprocessors(md), '_end')
        # md.postprocessors.add("MyPostprocessor", MyPostprocessor(md), '_end')

        del_tag = SimpleTagPattern(self.DEL_RE, 'del')
        md.inlinePatterns.add('del', del_tag, '_end')

        ins_tag = SimpleTagPattern(self.INS_RE, 'ins')
        md.inlinePatterns.add('ins', ins_tag, '_end')

        em_tag = SimpleTagPattern(self.EM_RE, 'em')
        md.inlinePatterns['emphasis'] = em_tag

        strong_tag = SimpleTagPattern(self.STRONG_RE, 'strong')
        md.inlinePatterns['strong'] = strong_tag
